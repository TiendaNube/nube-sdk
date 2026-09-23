---------------------------- MODULE HelperEvents ----------------------------
(***************************************************************************)
(* @tiendanube/nube-sdk-helper: subscription and async-render helpers.     *)
(*                                                                         *)
(* Code modeled                                                            *)
(*   packages/helper/src/lib/page-match.ts  onCheckoutStep (immediate call *)
(*                                          + "checkout:ready" listener)   *)
(*   packages/helper/src/lib/events.ts      onEvent -> nube.on / nube.off  *)
(*   packages/helper/src/lib/ui.ts          ui.render(Promise<slot>, c),   *)
(*                                          ui.render(slot, c), ui.clear   *)
(*                                                                         *)
(* Host behavior (confirmed in the host runtime, not in this repository): *)
(*   - checkout:ready is sticky: once dispatched it is kept and handed to  *)
(*     the app's first on("checkout:ready"), synchronously inside `on`;    *)
(*   - worker-side `on` appends duplicates and `off` removes the first     *)
(*     copy, i.e. multiset semantics (HOST_SET_SEMANTICS = FALSE).         *)
(*                                                                         *)
(*   HOST_READY_AFTER_START  checkout:ready can also fire live after       *)
(*                           App(nube) ran on a not-yet-ready checkout.    *)
(*                           Unconfirmed; suspected only.                  *)
(*   HOST_SET_SEMANTICS      kept to show what set semantics would break.  *)
(*                                                                         *)
(* Fix flag                                                                *)
(*   FIX_CHECKOUT_STEP_ONCE  onCheckoutStep subscribes first and only      *)
(*     handles the current step itself when `on` did not replay a          *)
(*     checkout:ready synchronously                                        *)
(*                                                                         *)
(* ui.render(Promise<slot>) ordering has no fix flag: it is reported as a  *)
(* suspected API-semantics issue.                                          *)
(***************************************************************************)
EXTENDS Naturals, Sequences

CONSTANTS HOST_READY_AFTER_START, HOST_SET_SEMANTICS, FIX_CHECKOUT_STEP_ONCE

VARIABLES
    \* onCheckoutStep
    ready,       \* checkout:ready already happened for the current step
    replayOwed,  \* the sticky checkout:ready is still owed to this app's
                 \*   first checkout:ready listener
    subscribed,  \* onCheckoutStep listener registered
    calls,       \* handler invocations for the current step
    calledEarly, \* history: handler ran while checkout was not ready
    \* onEvent(e, f) twice with the same f, then one unsubscribe
    regs,        \* host registrations of f (multiset size, or 0/1 with sets)
    handles,     \* live handles returned by onEvent
    \* ui.render with a promised slot
    pending,     \* sequence of components waiting for their slot query
    slot,        \* what the slot shows
    lastAsked    \* what the app asked for last ("empty" after ui.clear)

vars == <<ready, replayOwed, subscribed, calls, calledEarly, regs, handles,
          pending, slot, lastAsked>>

Init ==
    \* Without HOST_READY_AFTER_START the host only starts apps on a checkout
    \* that is already initialized.
    /\ ready \in (IF HOST_READY_AFTER_START THEN BOOLEAN ELSE {TRUE})
    \* Owed unless another checkout:ready listener of the app consumed it.
    /\ replayOwed \in (IF ready THEN BOOLEAN ELSE {FALSE})
    /\ subscribed = FALSE /\ calls = 0 /\ calledEarly = FALSE
    /\ regs = 0 /\ handles = 0
    /\ pending = <<>> /\ slot = "empty" /\ lastAsked = "empty"

U1 == UNCHANGED <<regs, handles, pending, slot, lastAsked>>
U2 == UNCHANGED <<ready, replayOwed, subscribed, calls, calledEarly, pending, slot, lastAsked>>
U3 == UNCHANGED <<ready, replayOwed, subscribed, calls, calledEarly, regs, handles>>

\* onCheckoutStep(handlers) on a checkout page. Before the fix: handle the
\* current step, then `on`, which may replay the sticky checkout:ready
\* synchronously into the listener. After: `on` first, and handle the
\* current step only if no replay happened.
OnCheckoutStep ==
    LET replayed == IF replayOwed THEN 1 ELSE 0
        direct == IF FIX_CHECKOUT_STEP_ONCE /\ replayOwed THEN 0 ELSE 1 IN
    /\ ~subscribed
    /\ subscribed' = TRUE
    /\ replayOwed' = FALSE
    /\ calls' = calls + replayed + direct
    /\ calledEarly' = (calledEarly \/ (direct = 1 /\ ~ready))
    /\ UNCHANGED ready /\ U1

\* A live checkout:ready. With nobody listening it is kept for the replay.
HostCheckoutReady ==
    /\ ~ready
    /\ HOST_READY_AFTER_START \/ ~subscribed
    /\ ready' = TRUE
    /\ replayOwed' = ~subscribed
    /\ calls' = IF subscribed THEN calls + 1 ELSE calls
    /\ UNCHANGED <<subscribed, calledEarly>> /\ U1

OnEvent ==
    /\ handles < 2
    /\ handles' = handles + 1
    /\ regs' = IF HOST_SET_SEMANTICS THEN 1 ELSE regs + 1
    /\ U2

Unsubscribe ==
    /\ handles > 0
    /\ handles' = handles - 1
    /\ regs' = IF HOST_SET_SEMANTICS THEN 0 ELSE regs - 1
    /\ U2

RenderPromised(c) ==
    /\ Len(pending) < 1
    /\ pending' = Append(pending, c)
    /\ lastAsked' = c
    /\ UNCHANGED slot /\ U3

RenderNow(c) ==
    /\ slot' = c /\ lastAsked' = c
    /\ UNCHANGED pending /\ U3

ClearSlot ==
    /\ slot' = "empty" /\ lastAsked' = "empty"
    /\ UNCHANGED pending /\ U3

SlotQueryResolves ==
    /\ pending # <<>>
    /\ slot' = Head(pending)
    /\ pending' = Tail(pending)
    /\ UNCHANGED lastAsked /\ U3

Next ==
    \/ OnCheckoutStep \/ HostCheckoutReady
    \/ OnEvent \/ Unsubscribe
    \/ RenderPromised("A") \/ RenderNow("B") \/ ClearSlot \/ SlotQueryResolves

Spec == Init /\ [][Next]_vars

-----------------------------------------------------------------------------
\* The checkout-step handler runs at most once per step.
StepHandlerOnce == calls <= 1

\* "Runs a handler when the checkout is ready" (JSDoc of onCheckoutStep).
StepHandlerOnlyWhenReady == ~calledEarly

\* Each live onEvent handle has its own registration.
HandlesIndependent == regs = handles

\* Once nothing is pending, the slot shows what the app asked for last.
LastRenderWins == pending = <<>> => slot = lastAsked
=============================================================================
