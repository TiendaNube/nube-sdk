/**
 * Local mode run from the DevTools panel of tab INSPECTED_TAB.
 *
 * Counterexamples from specs/tla/LocalModeReload.tla:
 *   ReloadTargetsInspected (FIX_RELOAD_INSPECTED_TAB off)
 *     Start -> dev server comes up -> user switches to another tab (the
 *     docked panel keeps polling) -> poll sees 200 -> reloads the ACTIVE tab.
 */
import { act } from "react";
import { type Root, createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LocalModeContent } from "./local-mode-content";

const INSPECTED_TAB = 1;
const ACTIVE_TAB = 2;
const SCRIPT_URL = "http://localhost:8080/main.min.js";

let root: Root;
let container: HTMLDivElement;
let reload: ReturnType<typeof vi.fn>;
let fetchMock: ReturnType<typeof vi.fn>;

function installChrome() {
	reload = vi.fn();
	(globalThis as unknown as { chrome: unknown }).chrome = {
		devtools: { inspectedWindow: { tabId: INSPECTED_TAB } },
		runtime: { sendMessage: vi.fn() },
		// Page storage reads find nothing stored; writes succeed.
		scripting: {
			executeScript: vi.fn(async (options: { args?: unknown[] }) => [
				{ result: options.args?.length === 3 ? true : null },
			]),
		},
		// The user has switched to another tab of the same window.
		tabs: { query: vi.fn(async () => [{ id: ACTIVE_TAB }]), reload },
	};
}

function button(label: string): HTMLButtonElement {
	const match = [...container.querySelectorAll("button")].find((element) =>
		element.textContent?.includes(label),
	);
	if (!match) throw new Error(`no "${label}" button`);
	return match;
}

async function click(label: string) {
	await act(async () => {
		button(label).click();
	});
}

/** Lets pending promises and timers (the 300 ms start delay) run. */
async function settle(ms = 400) {
	await act(async () => {
		await new Promise((resolve) => setTimeout(resolve, ms));
	});
}

describe("LocalModeContent", () => {
	beforeEach(async () => {
		(
			globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }
		).IS_REACT_ACT_ENVIRONMENT = true;
		installChrome();
		localStorage.clear();
		localStorage.setItem("nube-devtools-app-server-url", SCRIPT_URL);
		fetchMock = vi.fn(async () => ({ status: 200 }));
		vi.stubGlobal("fetch", fetchMock);

		container = document.createElement("div");
		document.body.appendChild(container);
		root = createRoot(container);
		await act(async () => root.render(<LocalModeContent />));
		await settle(0);
	});

	afterEach(async () => {
		await act(async () => root.unmount());
		container.remove();
		vi.unstubAllGlobals();
	});

	it("reloads the inspected tab once the script is served, not the active one", async () => {
		await click("Start");
		await settle();

		expect(fetchMock).toHaveBeenCalledWith(SCRIPT_URL, expect.anything());
		expect(reload).toHaveBeenCalledTimes(1);
		expect(reload).toHaveBeenCalledWith(INSPECTED_TAB);
	});

	it("reloads the inspected tab on stop, not the active one", async () => {
		await click("Start");
		await settle();
		reload.mockClear();

		await click("Stop");
		await settle(0);

		expect(reload).toHaveBeenCalledTimes(1);
		expect(reload).toHaveBeenCalledWith(INSPECTED_TAB);
	});
});
