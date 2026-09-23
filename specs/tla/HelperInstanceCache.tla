------------------------- MODULE HelperInstanceCache -------------------------
(***************************************************************************)
(* @tiendanube/nube-sdk-helper: the registered NubeSDK instance and the    *)
(* module-level caches derived from it.                                    *)
(*                                                                         *)
(* Code modeled                                                            *)
(*   packages/helper/src/lib/instance.ts  setNubeInstance / clearNubeInstance*)
(*                                        / getNubeInstance                 *)
(*   packages/helper/src/lib/slots.ts     getAvailableSlotsAPI memo `api`   *)
(*   packages/helper/src/lib/browser.ts   `browser` proxy memo `instance`,  *)
(*                                        clearBrowserCache                 *)
(*                                                                         *)
(* README/JSDoc contract: clearNubeInstance() "clears the registered       *)
(* instance (useful in tests)"; getAvailableSlotsAPI and the slot queries  *)
(* "@throws If no NubeSDK instance was registered". The browser cache has  *)
(* its own documented reset, clearBrowserCache().                          *)
(*                                                                         *)
(* The global fallback self.__SDK_INSTANCE__ is left out (None = absent).  *)
(*                                                                         *)
(* Fix flag                                                                *)
(*   FIX_SLOTS_OWNER  the slots memo remembers which instance produced it  *)
(*                    and is rebuilt when the registered instance changes  *)
(***************************************************************************)
EXTENDS Naturals

CONSTANTS Instances, MaxSteps, FIX_SLOTS_OWNER

None == "none"

VARIABLES
    registered,  \* registeredInstance in instance.ts
    slotsOwner,  \* instance whose adapter the slots memo holds, or None
    browserOwner,\* instance whose browser APIs the proxy memo holds, or None
    slotsStale,  \* history: a slot query did not use the registered instance
                 \*   (or did not throw while none was registered)
    browserStale,\* history: same for a `browser` property access
    steps

vars == <<registered, slotsOwner, browserOwner, slotsStale, browserStale, steps>>

Init ==
    /\ registered = None
    /\ slotsOwner = None
    /\ browserOwner = None
    /\ slotsStale = FALSE
    /\ browserStale = FALSE
    /\ steps = 0

\* What a query should resolve through right now.
Expected == IF registered = None THEN "throw" ELSE registered

Set(i) ==
    /\ registered' = i
    /\ UNCHANGED <<slotsOwner, browserOwner, slotsStale, browserStale>>

Clear ==
    /\ registered' = None
    /\ UNCHANGED <<slotsOwner, browserOwner, slotsStale, browserStale>>

\* Memo lookup as written in slots.ts / browser.ts:
\* `if (memo === null) memo = getNubeInstance()...; return memo`
\* returns <<result, newOwner>>.
Memo(owner) ==
    IF owner # None THEN <<owner, owner>>
    ELSE IF registered = None THEN <<"throw", None>>
    ELSE <<registered, registered>>

\* With the fix the memo is only reused while its owner is still registered.
SlotsLookup ==
    IF FIX_SLOTS_OWNER
    THEN IF registered = None THEN <<"throw", slotsOwner>>
         ELSE <<registered, registered>>
    ELSE Memo(slotsOwner)

\* getAvailableSlotsAPI() and every query built on it.
QuerySlots ==
    LET r == SlotsLookup IN
    /\ slotsOwner' = r[2]
    /\ slotsStale' = (slotsStale \/ r[1] # Expected)
    /\ UNCHANGED <<registered, browserOwner, browserStale>>

\* browser.<prop> through the lazy Proxy.
AccessBrowser ==
    LET r == Memo(browserOwner) IN
    /\ browserOwner' = r[2]
    /\ browserStale' = (browserStale \/ r[1] # Expected)
    /\ UNCHANGED <<registered, slotsOwner, slotsStale>>

ClearBrowserCache ==
    /\ browserOwner' = None
    /\ UNCHANGED <<registered, slotsOwner, slotsStale, browserStale>>

Next ==
    /\ steps < MaxSteps
    /\ steps' = steps + 1
    /\ \/ \E i \in Instances : Set(i)
       \/ Clear \/ QuerySlots \/ AccessBrowser \/ ClearBrowserCache

Spec == Init /\ [][Next]_vars

-----------------------------------------------------------------------------
\* A slot query goes through the instance registered at that moment, and
\* throws when none is (the documented @throws).
SlotsFollowInstance == ~slotsStale

\* Same property for `browser`. NOT part of the fixed configuration: the
\* stale browser cache is documented behavior with its own reset
\* (clearBrowserCache), so it is reported, not fixed.
BrowserFollowsInstance == ~browserStale
=============================================================================
