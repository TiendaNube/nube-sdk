import { describe, expect, it } from "vitest";
import type { NubeSDKComponentsSnapshot } from "../background/scripts/page-components";
import { PAGE_VIEW, buildComponentTree, findNode } from "./component-tree";
import {
	appOfSignal,
	buildSignalRows,
	collectSignalBindings,
} from "./signal-bindings";

const signal = (n: number, initialValue: unknown) => ({
	type: "signal",
	__internalId: `signal-123-${n}`,
	initialValue,
});

const status = signal(1, "idle");
const logged = signal(2, false);
const total = signal(3, 10);

const slots = {
	after_line_items: {
		type: "box",
		__internalId: "box-123-a",
		children: [
			{ type: "txt", __internalId: "txt-123-b", children: status },
			{
				type: "show",
				__internalId: "show-123-c",
				when: logged,
				fallback: {
					type: "txt",
					__internalId: "txt-123-d",
					children: "Sign in",
				},
				children: { type: "txt", __internalId: "txt-123-e", children: total },
			},
			{
				type: "matchValue",
				__internalId: "matchValue-123-f",
				of: status,
				children: [
					{
						type: "matchWhen",
						__internalId: "matchWhen-123-g",
						condition: { op: "is", value: "loading" },
						children: "Loading",
					},
					{
						type: "matchWhen",
						__internalId: "matchWhen-123-h",
						condition: { op: "oneOf", value: ["error", "timeout"] },
						children: "Failed",
					},
					{
						type: "matchDefault",
						__internalId: "matchDefault-123-i",
						children: "Ready",
					},
				],
			},
			{ type: "progress", __internalId: "progress-123-j", value: total },
		],
	},
};

function snapshot(
	signals: NubeSDKComponentsSnapshot["signals"] = {},
): NubeSDKComponentsSnapshot {
	return {
		page: slots,
		apps: { "123": slots },
		values: {},
		mounted: { after_line_items: 1 },
		signals,
	};
}

const tree = (signals?: NubeSDKComponentsSnapshot["signals"]) =>
	buildComponentTree(snapshot(signals), PAGE_VIEW);

describe("buildComponentTree with signals", () => {
	it("shows a signal child by its value, not as a component", () => {
		const [node] =
			findNode(tree(), "page:after_line_items.c.0")?.children ?? [];

		expect(node).toMatchObject({
			kind: "signal",
			name: '"idle"',
			signal: { id: "signal-123-1", value: "idle", synced: false },
		});
	});

	it("prefers the value of the page's store over the initial value", () => {
		const [node] =
			findNode(
				tree({ "signal-123-1": { value: "loading" } }),
				"page:after_line_items.c.0",
			)?.children ?? [];

		expect(node.signal).toEqual({
			id: "signal-123-1",
			value: "loading",
			initialValue: "idle",
			synced: true,
		});
	});

	it("reads a store entry without a value as undefined", () => {
		const [node] =
			findNode(tree({ "signal-123-1": {} }), "page:after_line_items.c.0")
				?.children ?? [];

		expect(node.signal).toMatchObject({ value: undefined, synced: true });
		expect(node.name).toBe("undefined");
	});

	it("splits a Show into its two branches and marks the mounted one", () => {
		const show = findNode(tree(), "page:after_line_items.c.1");

		expect(show?.name).toBe("Show");
		expect(show?.props).toEqual({});
		expect(show?.controlFlow).toMatchObject({
			kind: "show",
			active: "fallback",
			outcome: { valid: true, matches: false, text: "is true" },
		});
		expect(
			show?.children.map((c) => [c.kind, c.name, c.branch?.active]),
		).toEqual([
			["branch", "then", false],
			["branch", "fallback", true],
		]);
		// What is not mounted is marked all the way down.
		expect(show?.children[0].children[0].inactive).toBe(true);
		expect(show?.children[0].children[0].children[0].inactive).toBe(true);
		expect(show?.children[1].children[0].inactive).toBeUndefined();
	});

	it("follows the signal when the Show flips", () => {
		const show = findNode(
			tree({ "signal-123-2": { value: true } }),
			"page:after_line_items.c.1",
		);

		expect(show?.controlFlow?.active).toBe("then");
		expect(show?.children.map((c) => c.branch?.active)).toEqual([true, false]);
	});

	it("mounts nothing for a Show without fallback that does not match", () => {
		const [slot] = buildComponentTree(
			{
				...snapshot(),
				page: {
					s: {
						type: "show",
						__internalId: "show-123-z",
						when: logged,
						children: "x",
					},
				},
			},
			PAGE_VIEW,
		);
		const show = slot.children[0];

		expect(show.controlFlow?.active).toBeNull();
		expect(show.children.map((c) => c.name)).toEqual(["then"]);
	});

	it("reports a Show whose `when` is not a signal", () => {
		const [slot] = buildComponentTree(
			{
				...snapshot(),
				page: { s: { type: "show", __internalId: "show-123-z", when: true } },
			},
			PAGE_VIEW,
		);

		expect(slot.children[0].controlFlow).toMatchObject({
			signal: undefined,
			active: null,
		});
	});

	it("marks the case a Match.Value mounts", () => {
		const cases = (value?: string) =>
			findNode(
				tree(value ? { "signal-123-1": { value } } : {}),
				"page:after_line_items.c.2",
			);

		expect(cases()?.controlFlow?.active).toBe("Match.Default");
		expect(cases("loading")?.controlFlow?.active).toBe(
			'Match.When is "loading"',
		);
		expect(
			cases("timeout")?.children.map((c) => [c.name, c.branch?.active]),
		).toEqual([
			["Match.When", false],
			["Match.When", true],
			["Match.Default", false],
		]);
		// The condition moves out of the props, into the branch.
		expect(cases()?.children[0].props).toEqual({});
		expect(cases()?.children[0].branch?.outcome?.text).toBe('is "loading"');
	});

	it("keeps an invalid condition from matching", () => {
		const [slot] = buildComponentTree(
			{
				...snapshot(),
				page: {
					s: {
						type: "matchValue",
						__internalId: "matchValue-123-z",
						of: status,
						children: [
							{ type: "matchWhen", condition: { op: "unknown", value: 1 } },
						],
					},
				},
			},
			PAGE_VIEW,
		);
		const match = slot.children[0];

		expect(match.controlFlow?.active).toBeNull();
		expect(match.children[0].branch?.outcome?.valid).toBe(false);
	});

	it("lists the signals bound to props", () => {
		const progress = findNode(tree(), "page:after_line_items.c.3");

		expect(progress?.signalProps).toEqual([
			{
				prop: "value",
				id: "signal-123-3",
				value: 10,
				initialValue: 10,
				synced: false,
			},
		]);
	});
});

describe("collectSignalBindings", () => {
	it("finds every place a signal is used, with its role", () => {
		const bindings = collectSignalBindings(tree());

		expect(
			bindings.get("signal-123-1")?.map((b) => [b.role, b.component, b.active]),
		).toEqual([
			["text", "Text", undefined],
			["match", "Match.Value", "Match.Default"],
		]);
		expect(
			bindings.get("signal-123-2")?.map((b) => [b.role, b.component, b.active]),
		).toEqual([["show", "Show", "fallback"]]);
		expect(
			bindings
				.get("signal-123-3")
				?.map((b) => [b.role, b.component, b.prop, b.inactive]),
		).toEqual([
			["text", "Text", undefined, true],
			["prop", "Progress", "value", false],
		]);
	});

	it("points a text binding at the component around it", () => {
		const [binding] = collectSignalBindings(tree()).get("signal-123-1") ?? [];

		expect(binding).toMatchObject({
			nodeKey: "page:after_line_items.c.0.c",
			domIds: ["txt-123-b"],
			slot: "after_line_items",
			app: "123",
		});
	});

	it("keeps the entry of a repeatable slot", () => {
		const [slot] = buildComponentTree(
			{
				...snapshot(),
				page: {
					product_grid_item: {
						"10": { type: "txt", __internalId: "txt-123-x", children: total },
						"11": { type: "txt", __internalId: "txt-123-y", children: total },
					},
				},
			},
			PAGE_VIEW,
		);

		expect(
			collectSignalBindings([slot])
				.get("signal-123-3")
				?.map((b) => b.entryKey),
		).toEqual(["10", "11"]);
	});
});

describe("buildSignalRows", () => {
	const record = (
		seq: number,
		changes: NubeSDKDevtoolsSignalChange[],
		rejected: string[] = [],
	): NubeSDKDevtoolsSignalsRecord => ({
		seq,
		app: "123",
		changes,
		rejected,
		timestamp: 1_000 + seq,
	});

	it("lists the signals of the trees, still on their initial value", () => {
		const rows = buildSignalRows(collectSignalBindings(tree()), []);

		expect(rows.map((r) => [r.id, r.app, r.status, r.value])).toEqual([
			["signal-123-1", "123", "initial", "idle"],
			["signal-123-2", "123", "initial", false],
			["signal-123-3", "123", "initial", 10],
		]);
	});

	it("adds the history and takes the value from the last change", () => {
		const rows = buildSignalRows(collectSignalBindings(tree()), [
			record(0, [
				{ id: "signal-123-1", value: "loading", hadPrev: false },
				{ id: "signal-123-3", value: 11, hadPrev: false },
			]),
			record(1, [
				{ id: "signal-123-1", value: "done", prev: "loading", hadPrev: true },
			]),
		]);
		const row = rows[0];

		expect(row).toMatchObject({
			status: "synced",
			value: "done",
			initialValue: "idle",
			lastChange: 1_001,
		});
		expect(row.changes).toEqual([
			{
				seq: 0,
				timestamp: 1_000,
				value: "loading",
				prev: undefined,
				hadPrev: false,
				batchSize: 2,
			},
			{
				seq: 1,
				timestamp: 1_001,
				value: "done",
				prev: "loading",
				hadPrev: true,
				batchSize: 1,
			},
		]);
	});

	it("keeps a signal no tree uses anymore as an orphan", () => {
		const rows = buildSignalRows(new Map(), [
			record(0, [{ id: "signal-123-9", value: 1, hadPrev: false }]),
		]);

		expect(rows).toMatchObject([
			{ id: "signal-123-9", status: "orphan", value: 1, bindings: [] },
		]);
	});

	it("lists the signals the platform refused, under the app that sent them", () => {
		const rows = buildSignalRows(new Map(), [
			record(0, [], ["signal-999-1"]),
			record(1, [], ["signal-999-1"]),
		]);

		expect(rows).toMatchObject([
			{ id: "signal-999-1", app: "123", status: "rejected" },
		]);
	});

	it("sorts by app, then by creation order", () => {
		const rows = buildSignalRows(new Map(), [
			{
				...record(0, [{ id: "signal-9-10", value: 1, hadPrev: false }]),
				app: "9",
			},
			{
				...record(1, [{ id: "signal-9-2", value: 1, hadPrev: false }]),
				app: "9",
			},
			record(2, [{ id: "signal-123-1", value: 1, hadPrev: false }]),
		]);

		expect(rows.map((r) => r.id)).toEqual([
			"signal-123-1",
			"signal-9-2",
			"signal-9-10",
		]);
	});
});

describe("appOfSignal", () => {
	it("reads the app id out of the signal id", () => {
		expect(appOfSignal("signal-123-a")).toBe("123");
		expect(appOfSignal("signal-123_901-1f")).toBe("123_901");
		expect(appOfSignal("nope")).toBe("unknown");
	});
});

describe("buildSignalRows with the graph of the app", () => {
	const graph: NubeSDKDevtoolsSignalGraph = {
		app: "123",
		connected: false,
		signals: [
			{ id: "signal-123-1", kind: "signal", rendered: true },
			{ id: "signal-123-2", kind: "signal", rendered: true },
			{
				id: "signal-123-3",
				kind: "computed",
				rendered: true,
				deps: ["signal-123-4", "signal-123-5"],
			},
			{ id: "signal-123-4", kind: "signal", rendered: false },
			{ id: "signal-123-5", kind: "signal", rendered: false },
		],
		effects: [{ id: "effect-6", deps: ["signal-123-3", "signal-123-3"] }],
		unsynced: ["signal-123-1"],
		unserializable: ["signal-123-2"],
		timestamp: 1,
	};

	const rows = () =>
		buildSignalRows(collectSignalBindings(tree()), [], [graph]);
	const row = (id: string) => rows().find((r) => r.id === id);

	it("tells signals from computed ones", () => {
		expect(rows().map((r) => [r.id, r.kind])).toEqual([
			["signal-123-1", "signal"],
			["signal-123-2", "signal"],
			["signal-123-3", "computed"],
			["signal-123-4", "signal"],
			["signal-123-5", "signal"],
		]);
	});

	it("adds the signals that never left the worker, without a value", () => {
		expect(row("signal-123-4")).toMatchObject({
			status: "internal",
			app: "123",
			value: undefined,
			bindings: [],
		});
	});

	it("links a computed signal to its sources, both ways", () => {
		expect(row("signal-123-3")?.deps).toEqual(["signal-123-4", "signal-123-5"]);
		expect(row("signal-123-4")?.dependents).toEqual(["signal-123-3"]);
	});

	it("lists an effect once on each signal it depends on", () => {
		expect(row("signal-123-3")?.effects).toEqual([graph.effects[0]]);
	});

	it("flags what keeps the page from following a signal", () => {
		expect(row("signal-123-1")?.problems).toEqual(["unsynced"]);
		expect(row("signal-123-2")?.problems).toEqual(["unserializable"]);
		expect(row("signal-123-3")?.problems).toEqual([]);
	});

	it("does not let an app describe a signal the platform refused", () => {
		const refused = buildSignalRows(
			new Map(),
			[
				{
					seq: 0,
					app: "999",
					changes: [],
					rejected: ["signal-123-1"],
					timestamp: 1,
				},
			],
			[graph],
		).find((r) => r.id === "signal-123-1");

		expect(refused).toMatchObject({ status: "rejected", app: "999" });
		expect(refused?.kind).toBeUndefined();
	});
});
