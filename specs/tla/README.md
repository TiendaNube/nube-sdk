# TLA+ models of the Nube SDK's state and concurrency surfaces

Each spec models one surface of this repository closely enough to point at
code, and states the property the code is supposed to keep as a TLC invariant.
Every bug fix is a boolean `FIX_*` constant: with the flag `FALSE` the model
reproduces the code as it was and TLC prints a counterexample; with it `TRUE`
(the committed `.cfg`) the model reproduces the fixed code and TLC finds no
violation. Each counterexample was turned into a failing Vitest test before
the fix.

| Spec | Code | Invariants | Fix flags |
|---|---|---|---|
| `DevtoolsPorts` | `nube-devtools` content script ports (`src/contentScript/index.ts`) and the panel's `onConnect` listeners (`src/contexts/nube-sdk-{events,errors,storage}-context.tsx`) | `CrossTabIsolation`, `OwnPanelNotStarved`, `NoIdleErrorPorts` | `FIX_FILTER_BY_TAB`, `FIX_DISCONNECT_ERROR_PORTS` |
| `DevtoolsRequests` | panel -> service worker -> `executeScript` -> `sendResponse` (`src/background/*`, `src/devtools/pages/components.tsx`) | `EveryRequestAnswered`, `NoCallbackThrows` | `FIX_GUARD_COMPONENT_RESULTS` |
| `LocalModeReload` | Local mode start/stop/poll/reload (`src/components/local-mode-content.tsx`) | `ReloadTargetsInspected`, `SingleLivePollLoop`, `AtMostOnePollReloadPerStart` | `FIX_RELOAD_INSPECTED_TAB`, `FIX_POLL_GENERATION` |
| `HelperInstanceCache` | `helper` instance registration and the caches derived from it (`src/lib/{instance,slots,browser}.ts`) | `SlotsFollowInstance` (and `BrowserFollowsInstance`, reported only: `clearBrowserCache` is the documented reset) | `FIX_SLOTS_OWNER` |
| `HelperEvents` | `helper` `onCheckoutStep`, `onEvent`, `ui.render(Promise<slot>)` | `StepHandlerOnce`, `StepHandlerOnlyWhenReady`, `HandlesIndependent`, `LastRenderWins` | none: host-dependent, reported as suspected |

Assumptions about the environment (Chrome's port semantics, what the host
runtime does) are spelled out in each spec's header. Where the documentation
allows two readings, both are constants and both are checked (for example
`CHROME_ANY_DISCONNECT_CLOSES_SENDER`).

## Running

Needs Java 11+ and `tla2tools.jar` (TLC):

```sh
TLA2TOOLS=/path/to/tla2tools.jar specs/tla/check.sh
```

`check.sh` runs every committed configuration (must pass), then turns each
fix flag off, one invariant at a time, and expects TLC to report that
invariant as violated. It exits non-zero if either expectation fails, so it
also guards the models against being weakened until they prove nothing.
