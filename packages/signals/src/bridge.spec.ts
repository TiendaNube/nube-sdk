import type { NubeSDK } from "@tiendanube/nube-sdk-types";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type Signals = typeof import("./index");

const nube = {} as NubeSDK;

let postMessage: ReturnType<typeof vi.fn>;
let listeners: ((event: MessageEvent) => void)[];
let signals: Signals;

function sent() {
	return postMessage.mock.calls.map(([message]) =>
		JSON.parse(message as string),
	);
}

function receive(data: unknown) {
	for (const listener of listeners) listener({ data } as MessageEvent);
}

function update(entries: { id: string; value: unknown }[]) {
	receive(
		JSON.stringify({ type: "internal:signals:update", data: { entries } }),
	);
}

const tick = () => new Promise<void>((resolve) => queueMicrotask(resolve));

/** Serializes signals as `nube.render` does with a component tree. */
function render(...nodes: unknown[]) {
	JSON.stringify({ children: nodes });
}

beforeEach(async () => {
	postMessage = vi.fn();
	listeners = [];
	vi.stubGlobal("self", {
		__APP_DATA__: { id: "123", script: "app.js" },
		postMessage,
		addEventListener: (_: string, listener: (event: MessageEvent) => void) => {
			listeners.push(listener);
		},
	});
	vi.resetModules();
	signals = await import("./index");
});

afterEach(() => {
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

describe("useSignals", () => {
	it("sends nothing before it is called", async () => {
		const count = signals.signal(0);
		render(count);
		count.value = 1;
		await tick();
		expect(postMessage).not.toHaveBeenCalled();
	});

	it("does not send the changes made before the call", async () => {
		const count = signals.signal(0);
		render(count);
		count.value = 1;
		signals.useSignals(nube);
		await tick();
		expect(postMessage).not.toHaveBeenCalled();
	});

	it("returns the signal functions", () => {
		expect(signals.useSignals(nube)).toEqual({
			signal: signals.signal,
			computed: signals.computed,
			effect: signals.effect,
			batch: signals.batch,
		});
	});

	it("listens to the platform only once", () => {
		signals.useSignals(nube);
		signals.useSignals(nube);
		expect(listeners).toHaveLength(1);
	});

	it("rejects a missing instance", () => {
		expect(() => signals.useSignals(undefined as unknown as NubeSDK)).toThrow(
			TypeError,
		);
	});
});

describe("internal:signals:sync", () => {
	beforeEach(() => {
		signals.useSignals(nube);
	});

	it("batches the writes of a microtask, with the last value", async () => {
		const count = signals.signal(0);
		render(count);
		count.value = 1;
		count.value = 2;
		await tick();
		expect(sent()).toEqual([
			{
				app: "123",
				type: "internal:signals:sync",
				data: { entries: [{ id: count.__internalId, value: 2 }] },
			},
		]);
	});

	it("does not send signals when they are created", async () => {
		signals.signal(1);
		signals.computed(() => 2, [signals.signal(0)]);
		await tick();
		expect(postMessage).not.toHaveBeenCalled();
	});

	it("includes computed signals", async () => {
		const count = signals.signal(1);
		const doubled = signals.computed(() => count.value * 2, [count]);
		render(count, doubled);

		count.value = 2;
		await tick();

		expect(sent()[0].data.entries).toEqual([
			{ id: count.__internalId, value: 2 },
			{ id: doubled.__internalId, value: 4 },
		]);
	});

	it("stops sharing a disposed computed signal", async () => {
		const count = signals.signal(1);
		const doubled = signals.computed(() => count.value * 2, [count]);
		render(count, doubled);
		doubled.dispose();
		count.value = 5;
		await tick();
		expect(doubled.value).toBe(2);
		expect(sent()[0].data.entries).toEqual([
			{ id: count.__internalId, value: 5 },
		]);
	});

	it("reports a value that cannot be serialized", async () => {
		const error = vi.spyOn(console, "error").mockImplementation(() => {});
		const big = signals.signal(10n);
		// A BigInt cannot be serialized, so read the node as a copy would.
		void big.initialValue;
		big.value = 11n;
		await tick();
		expect(postMessage).not.toHaveBeenCalled();
		expect(error).toHaveBeenCalled();
	});

	it("still sends the other signals of the batch when one cannot be serialized", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		const big = signals.signal(10n);
		const count = signals.signal(0);
		void big.initialValue; // see above
		render(count);
		big.value = 11n;
		count.value = 1;
		await tick();
		expect(sent()[0].data.entries).toEqual([
			{ id: count.__internalId, value: 1 },
		]);
	});

	it("omits the value of a signal set to undefined", async () => {
		const name = signals.signal<string | undefined>("Ana");
		render(name);
		name.value = undefined;
		await tick();
		expect(sent()[0].data.entries).toEqual([{ id: name.__internalId }]);
	});
});

describe("only signals that reached a tree", () => {
	beforeEach(() => {
		signals.useSignals(nube);
	});

	it("does not send a signal that was never rendered", async () => {
		const cart = signals.signal<Record<string, number>>({});
		const count = signals.computed(
			() => Object.values(cart.value).reduce((a, b) => a + b, 0),
			[cart],
		);
		const label = signals.computed(() => `${count.value} items`, [count]);
		render(label);

		cart.value = { tshirt: 2 };
		await tick();

		expect(sent()[0].data.entries).toEqual([
			{ id: label.__internalId, value: "2 items" },
		]);
	});

	it("starts sending a signal once it is rendered", async () => {
		const count = signals.signal(0);
		count.value = 1;
		await tick();
		expect(postMessage).not.toHaveBeenCalled();

		render(count);
		count.value = 2;
		await tick();
		expect(sent()[0].data.entries).toEqual([
			{ id: count.__internalId, value: 2 },
		]);
	});

	it.each([
		["spread", (node: object) => ({ ...node })],
		["structuredClone", (node: object) => structuredClone(node)],
	])("counts a signal copied with %s as rendered", async (_, copy) => {
		const count = signals.signal(0);
		copy(count);
		count.value = 1;
		await tick();
		expect(sent()[0].data.entries).toEqual([
			{ id: count.__internalId, value: 1 },
		]);
	});
});

describe("internal:signals:update", () => {
	beforeEach(async () => {
		signals.useSignals(nube);
	});

	it("applies the values of the platform without sending them back", async () => {
		const name = signals.signal("Ana");
		render(name);
		await tick();
		postMessage.mockClear();

		update([{ id: name.__internalId, value: "Bia" }]);
		await tick();

		expect(name.value).toBe("Bia");
		expect(postMessage).not.toHaveBeenCalled();
	});

	it("applies several values in one batch and shares what derives from them", async () => {
		const first = signals.signal("Ana");
		const last = signals.signal("Lima");
		const full = signals.computed(
			() => `${first.value} ${last.value}`,
			[first, last],
		);
		const fn = vi.fn();
		signals.effect(fn, [first, last]);
		render(first, last, full);
		await tick();
		postMessage.mockClear();

		update([
			{ id: first.__internalId, value: "Bia" },
			{ id: last.__internalId, value: "Souza" },
		]);
		await tick();

		expect(fn).toHaveBeenCalledTimes(2);
		expect(sent()[0].data.entries).toEqual([
			{ id: full.__internalId, value: "Bia Souza" },
		]);
	});

	it("does not set computed signals", () => {
		const count = signals.signal(1);
		const doubled = signals.computed(() => count.value * 2, [count]);
		update([{ id: doubled.__internalId, value: 100 }]);
		expect(doubled.value).toBe(2);
	});

	it.each([
		["a structured-clone message", { type: "internal:signals:update" }],
		["invalid JSON", "{"],
		[
			"another event",
			JSON.stringify({ type: "internal:storage:get", data: {} }),
		],
		[
			"an update without entries",
			JSON.stringify({ type: "internal:signals:update" }),
		],
	])("ignores %s", (_, data) => {
		const count = signals.signal(1);
		receive(data);
		expect(count.value).toBe(1);
	});

	it("ignores unknown ids", () => {
		expect(() => update([{ id: "missing", value: 1 }])).not.toThrow();
	});
});
