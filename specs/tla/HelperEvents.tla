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
(* The host runtime (not in this repository) decides when checkout:ready   *)
(* fires and how on/off treat a listener registered twice. Those choices   *)
(* are constants, so TLC explores both. No fix flags: everything found     *)
(* here depends on host behavior or on API semantics this repository does  *)
(* not pin down, so it is reported as SUSPECTED, not fixed.                *)
(*                                                                         *)
(*   HOST_READY_AFTER_START  checkout:ready can fire after App(nube) has   *)
(*                           run on a checkout page                        *)
(*   HOST_SET_SEMANTICS      nube.on dedupes by function identity and      *)
(*                           nube.off removes it (EventTarget-like)        *)
(***************************************************************************)
EXTENDS Naturals, Sequences

CONSTANTS HOST_READY_AFTER_START, HOST_SET_SEMANTICS

VARIABLES
    \* onCheckoutStep
    ready,       \* checkout:ready already happened for the current step
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

vars == <<ready, subscribed, calls, calledEarly, regs, handles,
          pending, slot, lastAsked>>

Init ==
    \* Without HOST_READY_AFTER_START the host only starts apps on a checkout
    \* that is already initialized.
    /\ ready \in (IF HOST_READY_AFTER_START THEN BOOLEAN ELSE {TRUE})
    /\ subscribed = FALSE /\ calls = 0 /\ calledEarly = FALSE
    /\ regs = 0 /\ handles = 0
    /\ pending = <<>> /\ slot = "empty" /\ lastAsked = "empty"

U1 == UNCHANGED <<regs, handles, pending, slot, lastAsked>>
U2 == UNCHANGED <<ready, subscribed, calls, calledEarly, pending, slot, lastAsked>>
U3 == UNCHANGED <<ready, subscribed, calls, calledEarly, regs, handles>>

\* onCheckoutStep(handlers) on a checkout page: calls the current step's
\* handler right away, then listens to checkout:ready.
OnCheckoutStep ==
    /\ ~subscribed
    /\ subscribed' = TRUE
    /\ calls' = calls + 1
    /\ calledEarly' = (calledEarly \/ ~ready)
    /\ UNCHANGED ready /\ U1

HostCheckoutReady ==
    /\ ~ready
    /\ HOST_READY_AFTER_START \/ ~subscribed
    /\ ready' = TRUE
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
