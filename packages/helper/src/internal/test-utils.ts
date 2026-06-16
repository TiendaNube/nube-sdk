/**
 * @fileoverview Shared test helpers (not part of the public API / build entry).
 */

import type { NubeSDK, NubeSDKState } from "@tiendanube/nube-sdk-types";
import { vi } from "vitest";

/**
 * Builds a minimal `NubeSDKState` for tests. Pass partials to override slices.
 */
export function createMockState(
	overrides: Partial<NubeSDKState> = {},
): NubeSDKState {
	return {
		cart: { items: [] },
		location: { url: "", page: { type: "home", data: undefined }, queries: {} },
		customer: null,
		...overrides,
	} as unknown as NubeSDKState;
}

/**
 * Builds a fully mocked `NubeSDK` whose methods are vitest spies.
 * `getState` returns the provided state.
 */
export function createMockSDK(
	state: NubeSDKState = createMockState(),
): NubeSDK {
	return {
		on: vi.fn(),
		off: vi.fn(),
		send: vi.fn(),
		getState: vi.fn(() => state),
		getBrowserAPIs: vi.fn(),
		render: vi.fn(),
		clearSlot: vi.fn(),
		getAppSettings: vi.fn(() => ({})),
	} as unknown as NubeSDK;
}
