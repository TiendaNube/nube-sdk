import { readFileSync } from "node:fs";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { NubeSDKPerformanceRecord } from "../background/scripts/page-performance";

const SCRIPT = readFileSync(
	path.resolve(__dirname, "../../public/inject-performance-monitor.js"),
	"utf8",
);

type Listener = (event: { data: unknown }) => void;

type PageWindow = {
	__NUBE_SDK_APPS__?: { id: string; worker: unknown }[];
	__NUBE_DEVTOOLS_PERFORMANCE__?: NubeSDKPerformanceRecord[];
	dispatchEvent: () => boolean;
};

const globals = globalThis as unknown as { window?: PageWindow };

function createWorker() {
	const listeners: Listener[] = [];
	return {
		addEventListener: (_type: string, listener: Listener) => {
			listeners.push(listener);
		},
		post: (message: unknown) => {
			const data = JSON.stringify(message);
			for (const listener of listeners) listener({ data });
			return data;
		},
	};
}

/** Loads the monitor and registers one app, the way the register bundle does. */
function startApp(appId = "app-1") {
	new Function(SCRIPT)();
	const worker = createWorker();
	globals.window?.__NUBE_SDK_APPS__?.push({ id: appId, worker });
	return worker;
}

function slotSet(appId: string, slots: Record<string, unknown>) {
	return {
		app: appId,
		type: "ui:slot:set",
		changes: { cart: { items: [] }, ui: { slots } },
	};
}

function firstRenders() {
	return (globals.window?.__NUBE_DEVTOOLS_PERFORMANCE__ ?? []).filter(
		(record) => record.source === "first-render",
	);
}

const text = (children: unknown) => ({
	type: "txt",
	__internalId: "txt-app-1-a",
	children,
});

const signalNode = {
	type: "signal",
	__internalId: "signal-app-1-1",
	initialValue: 0,
};

describe("inject-performance-monitor first render", () => {
	beforeEach(() => {
		globals.window = { dispatchEvent: () => true };
	});

	afterEach(() => {
		globals.window = undefined;
	});

	it("reports the slots, signals and size of the first render", () => {
		const worker = startApp();
		const raw = worker.post(
			slotSet("app-1", {
				before_main_content: text("Hello"),
				after_line_items: text(["Items: ", signalNode]),
			}),
		);

		const [record] = firstRenders();
		expect(record).toMatchObject({
			appId: "app-1",
			kind: "lifecycle",
			slots: ["after_line_items", "before_main_content"],
			signals: true,
			treeSize: raw.length,
		});
	});

	it("reports no signals for plain trees", () => {
		const worker = startApp();
		worker.post(slotSet("app-1", { before_main_content: text("Hello") }));

		expect(firstRenders()[0]).toMatchObject({
			slots: ["before_main_content"],
			signals: false,
		});
	});

	it("does not take a type: signal prop without an id for a signal", () => {
		const worker = startApp();
		worker.post(
			slotSet("app-1", {
				before_main_content: { type: "field", props: { type: "signal" } },
			}),
		);

		expect(firstRenders()[0]?.signals).toBe(false);
	});

	it("skips a message that only clears slots", () => {
		const worker = startApp();
		worker.post(slotSet("app-1", { before_main_content: null }));

		expect(firstRenders()).toHaveLength(0);

		worker.post(
			slotSet("app-1", {
				before_main_content: null,
				after_line_items: text("Hello"),
			}),
		);

		expect(firstRenders()).toHaveLength(1);
		expect(firstRenders()[0]?.slots).toEqual(["after_line_items"]);
	});

	it("reports only the first render", () => {
		const worker = startApp();
		worker.post(slotSet("app-1", { before_main_content: text("Hello") }));
		worker.post(slotSet("app-1", { after_line_items: text("Bye") }));

		expect(firstRenders()).toHaveLength(1);
		expect(firstRenders()[0]?.slots).toEqual(["before_main_content"]);
	});
});
