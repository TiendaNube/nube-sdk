--------------------------- MODULE LocalModeReload ---------------------------
(***************************************************************************)
(* nube-devtools "Local mode", run from the DevTools panel.                *)
(*                                                                         *)
(* Code modeled                                                            *)
(*   packages/nube-devtools/src/components/local-mode-content.tsx          *)
(*     handleStart -> checkScriptAvailability -> runAttempt (poll loop:    *)
(*     fetch the script, retry every POLL_INTERVAL_MS up to                *)
(*     MAX_POLL_ATTEMPTS, reload the tab once the script answers 200)      *)
(*     handleStop  -> cancelPolling, mark stored state disconnected,       *)
(*     reload the tab                                                      *)
(*     reloadCurrentTab -> chrome.tabs.query({active, currentWindow})       *)
(*                                                                         *)
(* Environment                                                             *)
(*   The panel belongs to tab Inspected. The user may switch the active   *)
(*   tab at any time (the docked panel keeps running in the background),   *)
(*   and a detached DevTools window makes "active tab" differ routinely    *)
(*   (see the comment on resolveTabId in src/utils/page-storage.ts).       *)
(*   A fetch is in flight for an unbounded time and cannot be aborted.     *)
(*   DETACHED = FALSE: DevTools is docked, so the user can only click in   *)
(*   the panel while its tab is the active one; timers keep running after  *)
(*   they switch away.                                                     *)
(*                                                                         *)
(* Fix flags                                                               *)
(*   FIX_RELOAD_INSPECTED_TAB  reload the inspected tab when there is one  *)
(*   FIX_POLL_GENERATION       each poll loop captures a generation number *)
(*                             that every Start bumps, so a loop left over *)
(*                             from an earlier Start stops at its next     *)
(*                             check instead of being revived when Start   *)
(*                             resets the shared `pollCancelledRef`        *)
(***************************************************************************)
EXTENDS Naturals, FiniteSets

CONSTANTS Tabs, Inspected, MaxAttempts, MaxStarts, DETACHED,
          FIX_RELOAD_INSPECTED_TAB, FIX_POLL_GENERATION

ASSUME Inspected \in Tabs

VARIABLES
    active,       \* the active tab of the current window
    status,       \* "idle" | "connected"
    cancelled,    \* pollCancelledRef.current
    gen,          \* poll generation (only read when FIX_POLL_GENERATION)
    loops,        \* in-flight runAttempt chains
    timeoutRef,   \* pollTimeoutRef.current: id of the loop it belongs to, or 0
    serverUp,     \* the local dev server answers 200
    starts,       \* number of Start clicks so far (bound)
    pollReloads,  \* reloads issued by poll loops since the last Start
    badReload     \* history: some reload hit a tab other than Inspected

vars == <<active, status, cancelled, gen, loops, timeoutRef, serverUp,
          starts, pollReloads, badReload>>

Loop == [id : 1..MaxStarts, g : Nat, att : 1..MaxAttempts, ph : {"fetch", "wait"}]

TypeOK ==
    /\ active \in Tabs
    /\ status \in {"idle", "connected"}
    /\ cancelled \in BOOLEAN
    /\ loops \subseteq Loop
    /\ timeoutRef \in 0..MaxStarts
    /\ serverUp \in BOOLEAN
    /\ badReload \in BOOLEAN

Init ==
    /\ active = Inspected
    /\ status = "idle"
    /\ cancelled = FALSE
    /\ gen = 0
    /\ loops = {}
    /\ timeoutRef = 0
    /\ serverUp = FALSE
    /\ starts = 0
    /\ pollReloads = 0
    /\ badReload = FALSE

\* The panel is visible, so its buttons can be clicked.
CanClick == DETACHED \/ active = Inspected

ReloadTarget == IF FIX_RELOAD_INSPECTED_TAB THEN Inspected ELSE active

\* The check each runAttempt makes before and after its fetch.
Alive(l) == ~cancelled /\ (FIX_POLL_GENERATION => l.g = gen)

Start ==
    /\ CanClick /\ status = "idle" /\ starts < MaxStarts
    /\ status' = "connected"
    /\ cancelled' = FALSE
    /\ gen' = gen + 1
    /\ starts' = starts + 1
    /\ loops' = loops \cup {[id |-> starts + 1, g |-> gen + 1, att |-> 1, ph |-> "fetch"]}
    /\ pollReloads' = 0
    /\ UNCHANGED <<active, timeoutRef, serverUp, badReload>>

\* cancelPolling() clears only the timeout held in pollTimeoutRef; then the
\* stop handler reloads the tab.
Stop ==
    /\ CanClick /\ status = "connected"
    /\ status' = "idle"
    /\ cancelled' = TRUE
    /\ loops' = {l \in loops : ~(l.ph = "wait" /\ l.id = timeoutRef)}
    /\ timeoutRef' = 0
    /\ badReload' = (badReload \/ ReloadTarget # Inspected)
    /\ UNCHANGED <<active, gen, serverUp, starts, pollReloads>>

FetchDone(l) ==
    /\ l \in loops /\ l.ph = "fetch"
    /\ IF ~Alive(l) \/ (~serverUp /\ l.att >= MaxAttempts)
       THEN /\ loops' = loops \ {l}
            /\ UNCHANGED <<timeoutRef, pollReloads, badReload>>
       ELSE IF serverUp
            THEN /\ loops' = loops \ {l}
                 /\ pollReloads' = pollReloads + 1
                 /\ badReload' = (badReload \/ ReloadTarget # Inspected)
                 /\ UNCHANGED timeoutRef
            ELSE /\ loops' = (loops \ {l}) \cup {[l EXCEPT !.ph = "wait"]}
                 /\ timeoutRef' = l.id
                 /\ UNCHANGED <<pollReloads, badReload>>
    /\ UNCHANGED <<active, status, cancelled, gen, serverUp, starts>>

TimerFires(l) ==
    /\ l \in loops /\ l.ph = "wait"
    /\ loops' = IF Alive(l)
                THEN (loops \ {l}) \cup {[l EXCEPT !.ph = "fetch", !.att = l.att + 1]}
                ELSE loops \ {l}
    /\ timeoutRef' = IF timeoutRef = l.id THEN 0 ELSE timeoutRef
    /\ UNCHANGED <<active, status, cancelled, gen, serverUp, starts,
                   pollReloads, badReload>>

ToggleServer ==
    /\ serverUp' = ~serverUp
    /\ UNCHANGED <<active, status, cancelled, gen, loops, timeoutRef, starts,
                   pollReloads, badReload>>

SwitchTab(t) ==
    /\ active # t
    /\ active' = t
    /\ UNCHANGED <<status, cancelled, gen, loops, timeoutRef, serverUp, starts,
                   pollReloads, badReload>>

Next ==
    \/ Start \/ Stop \/ ToggleServer
    \/ \E l \in loops : FetchDone(l) \/ TimerFires(l)
    \/ \E t \in Tabs : SwitchTab(t)

Spec == Init /\ [][Next]_vars

-----------------------------------------------------------------------------
\* Local mode only ever reloads the tab the panel inspects.
ReloadTargetsInspected == ~badReload

\* At most one poll loop is still acting on behalf of the panel.
SingleLivePollLoop == Cardinality({l \in loops : Alive(l)}) <= 1

\* One Start leads to at most one reload from polling.
AtMostOnePollReloadPerStart == pollReloads <= 1
=============================================================================
