--------------------------- MODULE DevtoolsRequests ---------------------------
(***************************************************************************)
(* Panel -> service worker -> chrome.scripting.executeScript -> response.  *)
(*                                                                         *)
(* Code modeled                                                            *)
(*   packages/nube-devtools/src/background/service-worker.ts (onMessage)   *)
(*   packages/nube-devtools/src/background/nube-dev-tools.ts (handlers)    *)
(*   packages/nube-devtools/src/devtools/pages/components.tsx (caller)     *)
(*                                                                         *)
(* Each request is one of the handlers that answer through sendResponse    *)
(* after an executeScript round trip. executeScript can fail: the          *)
(* inspected tab is navigating, shows an error page or a chrome:// URL.    *)
(* On failure Chrome calls the callback with `results === undefined`.      *)
(*                                                                         *)
(* The service worker's onMessage listener returns true for these          *)
(* requests, so the channel stays open until sendResponse is called. If    *)
(* the callback throws before calling it, Chrome eventually closes the     *)
(* channel and the panel callback runs with `response === undefined`.      *)
(*                                                                         *)
(* Fix flag                                                                *)
(*   FIX_GUARD_COMPONENT_RESULTS  handleDevToolsGetComponents reads         *)
(*     `results?.[0]?.result`, like every other handler, and the           *)
(*     Components page reads `response?.status`.                           *)
(***************************************************************************)
EXTENDS Naturals

CONSTANTS FIX_GUARD_COMPONENT_RESULTS

Requests == {"checkStatus", "fetchComponents", "replayEvent"}

\* Whether the service worker callback dereferences results without a guard.
Unguarded(r) == r = "fetchComponents" /\ ~FIX_GUARD_COMPONENT_RESULTS

\* Whether the panel callback dereferences the response without a guard
\* (components.tsx and events.tsx read `response.status`).
PanelUnguarded(r) ==
    CASE r = "fetchComponents" -> ~FIX_GUARD_COMPONENT_RESULTS
      [] r = "replayEvent"     -> TRUE
      [] r = "checkStatus"     -> FALSE   \* use-nube-status reads response?.status

VARIABLES
    phase,     \* [Requests -> {"idle","scripting","answered","closed","done"}]
    response,  \* [Requests -> {"none","value","undefined"}]
    swThrew,   \* [Requests -> BOOLEAN] SW callback threw a TypeError
    panelThrew \* [Requests -> BOOLEAN] panel callback threw a TypeError

vars == <<phase, response, swThrew, panelThrew>>

Init ==
    /\ phase = [r \in Requests |-> "idle"]
    /\ response = [r \in Requests |-> "none"]
    /\ swThrew = [r \in Requests |-> FALSE]
    /\ panelThrew = [r \in Requests |-> FALSE]

Send(r) ==
    /\ phase[r] = "idle"
    /\ phase' = [phase EXCEPT ![r] = "scripting"]
    /\ UNCHANGED <<response, swThrew, panelThrew>>

\* executeScript resolved: ok = TRUE gives results[0].result, FALSE gives
\* results === undefined.
ScriptDone(r) ==
    /\ phase[r] = "scripting"
    /\ \E ok \in BOOLEAN :
        IF ~ok /\ Unguarded(r)
        THEN \* `results[0].result` throws: sendResponse is never reached
             /\ swThrew' = [swThrew EXCEPT ![r] = TRUE]
             /\ phase' = [phase EXCEPT ![r] = "closed"]
             /\ UNCHANGED <<response, panelThrew>>
        ELSE /\ phase' = [phase EXCEPT ![r] = "answered"]
             /\ response' = [response EXCEPT ![r] = "value"]
             /\ UNCHANGED <<swThrew, panelThrew>>

\* The channel was left open with nobody to answer; Chrome closes it and the
\* panel's callback receives `undefined`.
ChannelClosed(r) ==
    /\ phase[r] = "closed"
    /\ phase' = [phase EXCEPT ![r] = "done"]
    /\ response' = [response EXCEPT ![r] = "undefined"]
    /\ panelThrew' = [panelThrew EXCEPT ![r] = PanelUnguarded(r)]
    /\ UNCHANGED swThrew

Receive(r) ==
    /\ phase[r] = "answered"
    /\ phase' = [phase EXCEPT ![r] = "done"]
    /\ UNCHANGED <<response, swThrew, panelThrew>>

Next == \E r \in Requests :
    Send(r) \/ ScriptDone(r) \/ ChannelClosed(r) \/ Receive(r)

Spec == Init /\ [][Next]_vars

-----------------------------------------------------------------------------
\* Every request the panel sends is answered with a value by the service worker.
EveryRequestAnswered ==
    \A r \in Requests : phase[r] = "done" => response[r] = "value"

\* Neither side throws while handling a request.
NoCallbackThrows ==
    \A r \in Requests : ~swThrew[r] /\ ~panelThrew[r]
=============================================================================
