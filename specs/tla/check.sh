#!/usr/bin/env bash
# Model-checks every spec in this directory with TLC.
#
#   TLA2TOOLS=/path/to/tla2tools.jar specs/tla/check.sh
#
# For each spec it runs
#   1. the committed <Spec>.cfg (all fixes on)      -> must PASS
#   2. one run per (fix flag off, invariant) pair   -> must find a counterexample
# and exits non-zero if any expectation is not met.
set -u
cd "$(dirname "$0")"
JAR="${TLA2TOOLS:-tla2tools.jar}"
OUT="${TLC_OUT:-$(mktemp -d)}"
mkdir -p "$OUT"
fail=0

tlc() { # spec cfg log
	java -XX:+UseParallelGC -cp "$JAR" tlc2.TLC -deadlock -workers 1 \
		-noGenerateSpecTE -metadir "$OUT/states" -config "$2" "$1.tla" >"$3" 2>&1
}

expect_pass() { # spec [constant-to-set-TRUE]
	local cfg="$1.cfg" log="$OUT/$1.fixed${2:+.$2}.log"
	if [ -n "${2:-}" ]; then
		cfg="$OUT/$1.fixed.$2.cfg"
		sed -e "s/$2 = FALSE/$2 = TRUE/" "$1.cfg" >"$cfg"
	fi
	tlc "$1" "$cfg" "$log"
	if grep -q "No error has been found" "$log"; then
		echo "PASS  $1 (fixed${2:+, $2=TRUE}): $(grep -o '[0-9,]* distinct states found' "$log")"
	else
		echo "FAIL  $1 (fixed${2:+, $2=TRUE}) expected no violation, see $log"; fail=1
	fi
}

expect_violation() { # spec flag-to-disable invariant
	local cfg="$OUT/$1.$2.$3.cfg" log="$OUT/$1.$2.$3.log"
	sed -e "s/$2 = TRUE/$2 = FALSE/" -e "s/^INVARIANTS.*/INVARIANTS $3/" "$1.cfg" >"$cfg"
	tlc "$1" "$cfg" "$log"
	if grep -q "Invariant $3 is violated" "$log"; then
		echo "BUG   $1 with $2=FALSE violates $3 ($(grep -c '^State [0-9]*:' "$log") states), trace: $log"
	else
		echo "FAIL  $1 with $2=FALSE expected $3 to be violated, see $log"; fail=1
	fi
}

expect_env_violation() { # spec constant invariant   (host assumption flipped)
	local cfg="$OUT/$1.$2.$3.cfg" log="$OUT/$1.$2.$3.log"
	sed -e "s/$2 = FALSE/$2 = TRUE/" -e "s/^INVARIANTS.*/INVARIANTS $3/" "$1.cfg" >"$cfg"
	tlc "$1" "$cfg" "$log"
	if grep -q "Invariant $3 is violated" "$log"; then
		echo "SUSP  $1 with $2=TRUE violates $3, trace: $log"
	else
		echo "FAIL  $1 with $2=TRUE expected $3 to be violated, see $log"; fail=1
	fi
}

expect_pass DevtoolsPorts
expect_pass DevtoolsPorts CHROME_ANY_DISCONNECT_CLOSES_SENDER
expect_violation DevtoolsPorts FIX_FILTER_BY_TAB CrossTabIsolation
expect_violation DevtoolsPorts FIX_FILTER_BY_TAB OwnPanelNotStarved
expect_violation DevtoolsPorts FIX_DISCONNECT_ERROR_PORTS NoIdleErrorPorts

expect_pass DevtoolsRequests
expect_violation DevtoolsRequests FIX_GUARD_COMPONENT_RESULTS NoCallbackThrows
expect_violation DevtoolsRequests FIX_GUARD_COMPONENT_RESULTS EveryRequestAnswered

expect_pass LocalModeReload
expect_violation LocalModeReload FIX_RELOAD_INSPECTED_TAB ReloadTargetsInspected
expect_violation LocalModeReload FIX_POLL_GENERATION SingleLivePollLoop
expect_violation LocalModeReload FIX_POLL_GENERATION AtMostOnePollReloadPerStart

expect_pass HelperInstanceCache
expect_violation HelperInstanceCache FIX_SLOTS_OWNER SlotsFollowInstance
# Documented behavior (clearBrowserCache is the reset), reported only:
expect_violation HelperInstanceCache FIX_SLOTS_OWNER BrowserFollowsInstance

# Suspected, host-dependent: no fix in this repository.
expect_pass HelperEvents
expect_env_violation HelperEvents HOST_READY_AFTER_START StepHandlerOnce
expect_env_violation HelperEvents HOST_READY_AFTER_START StepHandlerOnlyWhenReady
expect_env_violation HelperEvents HOST_SET_SEMANTICS HandlesIndependent
# Holds under no host assumption: a promised slot resolves after a later
# synchronous render/clear of the same slot and overwrites it.
expect_env_violation HelperEvents HOST_READY_AFTER_START LastRenderWins

exit $fail
