/**
 * The panel's `chrome.runtime.onConnect` listeners see the ports of every
 * tab's content script, not only the inspected one's.
 *
 * Counterexamples from specs/tla/DevtoolsPorts.tla (FIX_FILTER_BY_TAB off):
 *   CrossTabIsolation  - panel of tab 1 open, tab 2 sends a batch, panel 1
 *                        shows it.
 *   OwnPanelNotStarved - panel of tab 1 open, tab 2 sends a batch (panel 1
 *                        keeps tab 2's long-lived events port), panel of tab
 *                        2 opens, tab 2 sends again on the same port: panel
 *                        2 never hears of it.
 */
import { act, useEffect } from "react";
import { type Root, createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	NubeSDKErrorsProvider,
	useNubeSDKErrorsContext,
} from "./nube-sdk-errors-context";
import {
	NubeSDKEventsProvider,
	useNubeSDKEventsContext,
} from "./nube-sdk-events-context";
import {
	NubeSDKStorageProvider,
	useNubeSDKStorage,
} from "./nube-sdk-storage-context";

type ConnectListener = (port: chrome.runtime.Port) => void;

type FakePort = chrome.runtime.Port & {
	post: (message: unknown) => void;
	disconnect: ReturnType<typeof vi.fn>;
};

const INSPECTED_TAB = 1;
const OTHER_TAB = 2;
const STORAGE_KEY = "app-123-cart";

let onConnect: Set<ConnectListener>;

function fakePort(name: string, tabId: number): FakePort {
	const listeners: Array<(message: unknown) => void> = [];
	return {
		name,
		sender: { tab: { id: tabId } as chrome.tabs.Tab },
		onMessage: {
			addListener: (listener: (message: unknown) => void) =>
				listeners.push(listener),
		},
		onDisconnect: { addListener: () => {} },
		postMessage: () => {},
		disconnect: vi.fn(),
		post: (message: unknown) => {
			for (const listener of listeners) listener(message);
		},
	} as unknown as FakePort;
}

/** A content script in `tabId` calling `chrome.runtime.connect({ name })`. */
function connect(name: string, tabId: number): FakePort {
	const port = fakePort(name, tabId);
	for (const listener of onConnect) listener(port);
	return port;
}

function installChrome() {
	onConnect = new Set();
	const noopEvent = { addListener: () => {}, removeListener: () => {} };
	(globalThis as unknown as { chrome: unknown }).chrome = {
		devtools: {
			inspectedWindow: { tabId: INSPECTED_TAB },
			network: { onNavigated: noopEvent },
		},
		runtime: {
			onConnect: {
				addListener: (listener: ConnectListener) => onConnect.add(listener),
				removeListener: (listener: ConnectListener) =>
					onConnect.delete(listener),
			},
		},
		scripting: { executeScript: vi.fn(async () => [{ result: [] }]) },
		tabs: { query: vi.fn(async () => []) },
	};
}

let root: Root;
let snapshot: {
	events: number;
	errors: number;
	storage: string[];
};

function Probe() {
	const { events } = useNubeSDKEventsContext();
	const { totalErrors } = useNubeSDKErrorsContext();
	const { records } = useNubeSDKStorage();
	useEffect(() => {
		snapshot = {
			events: events.length,
			errors: totalErrors,
			storage: records.map((record) => record.storageKey),
		};
	});
	return null;
}

async function mountPanel() {
	const container = document.createElement("div");
	root = createRoot(container);
	await act(async () => {
		root.render(
			<NubeSDKErrorsProvider>
				<NubeSDKEventsProvider>
					<NubeSDKStorageProvider>
						<Probe />
					</NubeSDKStorageProvider>
				</NubeSDKEventsProvider>
			</NubeSDKErrorsProvider>,
		);
	});
}

const eventBatch = {
	payload: [
		{
			seq: 0,
			event: "cart:update",
			sender: "app",
			prev: {},
			next: {},
			timestamp: 0,
		},
	],
};
const errorBatch = { payload: [{ apps: { app: { errors: ["boom"] } } }] };
const storageBatch = {
	payload: [
		{
			method: "setItem",
			type: "localStorage",
			key: STORAGE_KEY,
			value: "1",
			timestamp: 0,
		},
	],
};

describe("panel ports from other tabs", () => {
	beforeEach(async () => {
		(
			globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }
		).IS_REACT_ACT_ENVIRONMENT = true;
		installChrome();
		await mountPanel();
	});

	afterEach(async () => {
		await act(async () => root.unmount());
	});

	it("shows what the inspected tab sends", async () => {
		await act(async () => {
			connect("nube-devtools-events", INSPECTED_TAB).post(eventBatch);
			connect("nube-devtools-error-events", INSPECTED_TAB).post(errorBatch);
			connect("nube-devtools-storage-events", INSPECTED_TAB).post(storageBatch);
		});

		expect(snapshot).toEqual({
			events: 1,
			errors: 1,
			storage: [STORAGE_KEY],
		});
	});

	it("does not show events, errors or storage writes of another tab", async () => {
		await act(async () => {
			connect("nube-devtools-events", OTHER_TAB).post(eventBatch);
			connect("nube-devtools-error-events", OTHER_TAB).post(errorBatch);
			connect("nube-devtools-storage-events", OTHER_TAB).post(storageBatch);
		});

		expect(snapshot).toEqual({ events: 0, errors: 0, storage: [] });
	});

	it("lets go of another tab's events port so that tab's own panel gets it", async () => {
		// Tab 2's content script keeps its events port open for as long as a
		// receiver holds it. If this panel held it, a panel opened on tab 2
		// later would never see a connection, hence never an event.
		const port = connect("nube-devtools-events", OTHER_TAB);

		expect(port.disconnect).toHaveBeenCalled();
	});

	// specs/tla/DevtoolsPorts.tla, NoIdleErrorPorts: the content script opens
	// one port per WebWorkerError and never closes it, so the panel must, as
	// the storage listener already does.
	it("closes an error port once its message is read", async () => {
		const port = connect("nube-devtools-error-events", INSPECTED_TAB);
		await act(async () => port.post(errorBatch));

		expect(snapshot.errors).toBe(1);
		expect(port.disconnect).toHaveBeenCalled();
	});
});
