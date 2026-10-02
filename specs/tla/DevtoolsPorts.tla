---------------------------- MODULE DevtoolsPorts ----------------------------
(***************************************************************************)
(* Content script  <->  DevTools panel port traffic in nube-devtools.       *)
(*                                                                         *)
(* Code modeled                                                            *)
(*   packages/nube-devtools/src/contentScript/index.ts                     *)
(*     - one long-lived "nube-devtools-events" port per tab, opened lazily  *)
(*       on the first batch and cleared from onDisconnect                  *)
(*     - one "nube-devtools-error-events" port per WebWorkerError           *)
(*     - one "nube-devtools-storage-events" port per storage batch          *)
(*   packages/nube-devtools/src/contexts/nube-sdk-{events,errors,storage}-  *)
(*   context.tsx  - the panel's chrome.runtime.onConnect listeners          *)
(*                                                                         *)
(* Chrome port semantics assumed (developer.chrome.com, message passing):  *)
(*   - runtime.connect() from a content script fires runtime.onConnect in  *)
(*     EVERY open extension page, i.e. in every open NubeSDK panel, whatever *)
(*     tab that panel inspects;                                            *)
(*   - onConnect fires once per connection: a panel that opens later never *)
(*     learns about a port that already exists;                            *)
(*   - the sender sees onDisconnect (asynchronously) once no receiver is   *)
(*     left: none was listening, every receiver called disconnect(), or    *)
(*     every receiving page unloaded.                                      *)
(*   - CHROME_ANY_DISCONNECT_CLOSES_SENDER: the docs also say that when a   *)
(*     connect() reaches several receivers and ANY of them disconnects,    *)
(*     the sender's onDisconnect fires. Both readings are checked.         *)
(*                                                                         *)
(* A panel is identified with the tab it inspects (DevTools is per tab).   *)
(*                                                                         *)
(* Fix flags                                                               *)
(*   FIX_FILTER_BY_TAB          panels ignore AND disconnect ports whose   *)
(*                              sender.tab.id is not the inspected tab     *)
(*   FIX_DISCONNECT_ERROR_PORTS the errors panel disconnects a port after  *)
(*                              reading its single message (as storage does)*)
(***************************************************************************)
EXTENDS Naturals, FiniteSets

CONSTANTS Tabs, MaxSteps, CHROME_ANY_DISCONNECT_CLOSES_SENDER,
          FIX_FILTER_BY_TAB, FIX_DISCONNECT_ERROR_PORTS

VARIABLES
    panelOpen,  \* [Tabs -> BOOLEAN]      panel inspecting tab p is open
    csPort,     \* [Tabs -> BOOLEAN]      content script's eventsPort !== null
    evRecv,     \* [Tabs -> SUBSET Tabs] receivers still attached to tab t's
                \*   events port. csPort[t] /\ evRecv[t] = {} means Chrome
                \*   closed it but onDisconnect has not run yet.
    shown,      \* [Tabs -> SUBSET (Kinds \X Tabs)]  what panel p displays,
                \*   tagged with the tab each record came from
    starved,    \* history: tab t's batch went over a LIVE port while panel t
                \*   was open, and panel t was not among the receivers
    idleErr,    \* [Tabs -> Nat] error ports panel p keeps open after their
                \*   only message was consumed
    steps

vars == <<panelOpen, csPort, evRecv, shown, starved, idleErr, steps>>

Kinds == {"event", "error", "storage"}

TypeOK ==
    /\ panelOpen \in [Tabs -> BOOLEAN]
    /\ csPort \in [Tabs -> BOOLEAN]
    /\ evRecv \in [Tabs -> SUBSET Tabs]
    /\ shown \in [Tabs -> SUBSET (Kinds \X Tabs)]
    /\ starved \in BOOLEAN
    /\ idleErr \in [Tabs -> Nat]

Init ==
    /\ panelOpen = [p \in Tabs |-> FALSE]
    /\ csPort = [t \in Tabs |-> FALSE]
    /\ evRecv = [t \in Tabs |-> {}]
    /\ shown = [p \in Tabs |-> {}]
    /\ starved = FALSE
    /\ idleErr = [p \in Tabs |-> 0]
    /\ steps = 0

\* Panels whose onConnect listener keeps a new port from tab t.
\* Without the fix every open panel keeps it (no sender.tab check).
Keepers(t) ==
    IF FIX_FILTER_BY_TAB
    THEN {p \in Tabs : panelOpen[p] /\ p = t}
    ELSE {p \in Tabs : panelOpen[p]}

Show(recv, kind, t) ==
    [p \in Tabs |-> IF p \in recv THEN shown[p] \cup {<<kind, t>>} ELSE shown[p]]

Step == steps' = steps + 1

OpenPanel(p) ==
    /\ ~panelOpen[p]
    /\ panelOpen' = [panelOpen EXCEPT ![p] = TRUE]
    /\ Step
    /\ UNCHANGED <<csPort, evRecv, shown, starved, idleErr>>

\* Closing DevTools unloads the panel: it leaves every port it held and its
\* React state (the lists) is gone.
ClosePanel(p) ==
    /\ panelOpen[p]
    /\ panelOpen' = [panelOpen EXCEPT ![p] = FALSE]
    /\ evRecv' = [t \in Tabs |-> evRecv[t] \ {p}]
    /\ shown' = [shown EXCEPT ![p] = {}]
    /\ idleErr' = [idleErr EXCEPT ![p] = 0]
    /\ Step
    /\ UNCHANGED <<csPort, starved>>

\* window "NubeSDKEvents" listener -> getEventsPort() -> port.postMessage.
EmitEventBatch(t) ==
    /\ IF ~csPort[t]
       THEN \* chrome.runtime.connect(): onConnect fires in every open panel;
            \* the message posted right after is delivered to the keepers.
            \* With the fix, foreign panels disconnect right away.
            LET recv == Keepers(t)
                rejected == {p \in Tabs : panelOpen[p]} \ recv IN
            /\ csPort' = [csPort EXCEPT ![t] = TRUE]
            /\ evRecv' = [evRecv EXCEPT ![t] =
                   IF CHROME_ANY_DISCONNECT_CLOSES_SENDER /\ rejected # {}
                   THEN {} ELSE recv]
            /\ shown' = Show(recv, "event", t)
            /\ starved' = (starved \/ (recv # {} /\ panelOpen[t] /\ t \notin recv))
       ELSE IF evRecv[t] = {}
            THEN \* port already closed, onDisconnect not yet run: the batch is
                 \* dropped (documented as acceptable in the content script)
                 UNCHANGED <<csPort, evRecv, shown, starved>>
            ELSE LET recv == evRecv[t] IN
                 /\ shown' = Show(recv, "event", t)
                 /\ starved' = (starved \/ (panelOpen[t] /\ t \notin recv))
                 /\ UNCHANGED <<csPort, evRecv>>
    /\ Step
    /\ UNCHANGED <<panelOpen, idleErr>>

\* port.onDisconnect in the content script: eventsPort = null.
CsOnDisconnect(t) ==
    /\ csPort[t] /\ evRecv[t] = {}
    /\ csPort' = [csPort EXCEPT ![t] = FALSE]
    /\ evRecv' = [evRecv EXCEPT ![t] = {}]
    /\ Step
    /\ UNCHANGED <<panelOpen, shown, starved, idleErr>>

\* window "NubeSDKErrorEvents" listener: a fresh port per error.
EmitError(t) ==
    LET recv == Keepers(t) IN
    /\ shown' = Show(recv, "error", t)
    /\ idleErr' = [p \in Tabs |->
                     IF p \in recv /\ ~FIX_DISCONNECT_ERROR_PORTS
                     THEN idleErr[p] + 1 ELSE idleErr[p]]
    /\ Step
    /\ UNCHANGED <<panelOpen, csPort, evRecv, starved>>

\* flushStorageEvents: a fresh port per batch, the panel disconnects it.
EmitStorageBatch(t) ==
    LET recv == Keepers(t) IN
    /\ shown' = Show(recv, "storage", t)
    /\ Step
    /\ UNCHANGED <<panelOpen, csPort, evRecv, starved, idleErr>>

\* Reload / navigation of tab t: a new content script with no port; ports
\* opened by the old document are gone for their receivers too.
Navigate(t) ==
    /\ csPort' = [csPort EXCEPT ![t] = FALSE]
    /\ evRecv' = [evRecv EXCEPT ![t] = {}]
    /\ Step
    /\ UNCHANGED <<panelOpen, shown, starved, idleErr>>

Next ==
    /\ steps < MaxSteps
    /\ \E x \in Tabs :
        \/ OpenPanel(x) \/ ClosePanel(x)
        \/ EmitEventBatch(x) \/ CsOnDisconnect(x)
        \/ EmitError(x) \/ EmitStorageBatch(x)
        \/ Navigate(x)

Spec == Init /\ [][Next]_vars

-----------------------------------------------------------------------------
(* Invariants *)

\* A panel only ever displays records that came from the tab it inspects.
CrossTabIsolation ==
    \A p \in Tabs : \A r \in shown[p] : r[2] = p

\* While panel t is open, a batch that tab t sends over a live port reaches it.
OwnPanelNotStarved == ~starved

\* No error port stays open after its only message was consumed.
NoIdleErrorPorts == \A p \in Tabs : idleErr[p] = 0
=============================================================================
