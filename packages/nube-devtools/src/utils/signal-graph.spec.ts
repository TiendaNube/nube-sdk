import { describe, expect, it } from "vitest";
import type { SignalBinding, SignalRow } from "./signal-bindings";
import {
	connectedNodeIds,
	layoutSignalGraph,
	shortSignalId,
} from "./signal-graph";

function row(id: string, fields: Partial<SignalRow> = {}): SignalRow {
	return {
		id: `signal-123-${id}`,
		app: "123",
		status: "synced",
		value: 0,
		bindings: [],
		changes: [],
		lastChange: 0,
		deps: [],
		dependents: [],
		effects: [],
		problems: [],
		...fields,
	};
}

function binding(fields: Partial<SignalBinding>): SignalBinding {
	return {
		signalId: "signal-123-1",
		role: "text",
		nodeKey: "k",
		component: "Text",
		domIds: [],
		slot: "s",
		inactive: false,
		state: { id: "signal-123-1", value: 0, initialValue: 0, synced: false },
		...fields,
	};
}

const S = (n: string) => `signal-123-${n}`;

describe("layoutSignalGraph", () => {
	const effect = { id: "effect-9", deps: [S("3")] };
	const rows = [
		row("1", { status: "internal" }),
		row("2", { status: "internal" }),
		row("3", {
			kind: "computed",
			deps: [S("1"), S("2")],
			effects: [effect],
			bindings: [binding({ signalId: S("3") })],
		}),
		row("4", {
			kind: "computed",
			deps: [S("3")],
			problems: ["unsynced"],
			bindings: [
				binding({ signalId: S("4"), role: "show", component: "Show" }),
			],
		}),
	];

	it("puts each signal one column after its furthest source", () => {
		const { nodes, columns, rows: height } = layoutSignalGraph(rows);

		expect(
			nodes
				.filter((n) => n.kind === "signal" || n.kind === "computed")
				.map((n) => [n.prefix, n.label, n.detail, n.kind, n.column, n.row]),
		).toEqual([
			// Worker only: no value on the page, so the kind stands in for it.
			[undefined, "signal", "1", "signal", 0, 0],
			[undefined, "signal", "2", "signal", 0, 1],
			["computed:", "0", "3", "computed", 1, 0],
			["computed:", "0", "4", "computed", 2, 0],
		]);
		expect(columns).toBe(4);
		expect(height).toBe(3);
	});

	it("puts effects and page uses in the last column", () => {
		const { nodes } = layoutSignalGraph(rows);

		expect(
			nodes
				.filter((n) => n.kind === "effect" || n.kind === "use")
				.map((n) => [n.kind, n.label, n.detail, n.column, n.signalId]),
		).toEqual([
			["effect", "effect", "9", 3, undefined],
			["use", "Text", "text", 3, S("3")],
			["use", "Show", "when", 3, S("4")],
		]);
	});

	it("draws an edge from each source to what reads it", () => {
		expect(layoutSignalGraph(rows).edges).toEqual([
			{ from: S("1"), to: S("3") },
			{ from: S("2"), to: S("3") },
			{ from: S("3"), to: S("4") },
			{ from: S("3"), to: "effect-9" },
			{ from: S("3"), to: `use:${S("3")}:Text:text` },
			{ from: S("4"), to: `use:${S("4")}:Show:when` },
		]);
	});

	it("marks internal signals and the ones with a problem", () => {
		const { nodes } = layoutSignalGraph(rows);

		expect(nodes.find((n) => n.id === S("1"))).toMatchObject({
			internal: true,
			problem: false,
			label: "signal",
		});
		expect(nodes.find((n) => n.id === S("4"))).toMatchObject({
			internal: false,
			problem: true,
		});
	});

	it("groups the uses that read alike, as in a repeatable slot", () => {
		const { nodes } = layoutSignalGraph([
			row("1", {
				bindings: [
					binding({ entryKey: "10", inactive: true }),
					binding({ entryKey: "11", inactive: true }),
					binding({ role: "prop", prop: "value", component: "Progress" }),
				],
			}),
		]);

		expect(
			nodes
				.filter((n) => n.kind === "use")
				.map((n) => [n.label, n.detail, n.inactive]),
		).toEqual([
			["Text", "text ×2", true],
			["Progress", "value", false],
		]);
	});

	it("shows a single effect once, however many signals it reads", () => {
		const shared = { id: "effect-5", deps: [S("1"), S("2")] };
		const { nodes, edges } = layoutSignalGraph([
			row("1", { effects: [shared] }),
			row("2", { effects: [shared] }),
		]);

		expect(nodes.filter((n) => n.kind === "effect")).toHaveLength(1);
		expect(nodes.find((n) => n.kind === "effect")).toMatchObject({
			label: "effect",
			detail: "5",
		});
		expect(edges).toEqual([
			{ from: S("1"), to: "effect-5" },
			{ from: S("2"), to: "effect-5" },
		]);
	});

	it("skips refused signals and sources it does not know", () => {
		const { nodes, edges } = layoutSignalGraph([
			row("1", { status: "rejected" }),
			row("2", { kind: "computed", deps: [S("1"), S("missing")] }),
		]);

		expect(nodes.map((n) => n.id)).toEqual([S("2")]);
		expect(edges).toEqual([]);
	});

	it("survives a cycle", () => {
		const { nodes } = layoutSignalGraph([
			row("1", { kind: "computed", deps: [S("2")] }),
			row("2", { kind: "computed", deps: [S("1")] }),
		]);

		expect(nodes).toHaveLength(2);
	});

	it("leads with the value of a signal on the page, shortened", () => {
		const { nodes } = layoutSignalGraph([
			row("1", { kind: "signal", value: "cart" }),
			row("2", { value: { text: "x".repeat(100) } }),
		]);

		expect(nodes[0]).toMatchObject({
			prefix: "value:",
			label: '"cart"',
			detail: "1",
		});
		expect(nodes[1].label).toHaveLength(40);
	});

	it("lays out nothing for no signals", () => {
		expect(layoutSignalGraph([])).toEqual({
			nodes: [],
			edges: [],
			columns: 0,
			rows: 0,
		});
	});
});

describe("connectedNodeIds", () => {
	const edges = [
		{ from: "a", to: "c" },
		{ from: "b", to: "c" },
		{ from: "c", to: "d" },
		{ from: "c", to: "e" },
		{ from: "x", to: "y" },
	];

	it("follows a node upstream and downstream, but not sideways", () => {
		expect([...connectedNodeIds(edges, "c")].sort()).toEqual([
			"a",
			"b",
			"c",
			"d",
			"e",
		]);
		// `b` feeds `c` too, but `a` does not depend on it.
		expect([...connectedNodeIds(edges, "a")].sort()).toEqual([
			"a",
			"c",
			"d",
			"e",
		]);
		expect([...connectedNodeIds(edges, "d")].sort()).toEqual([
			"a",
			"b",
			"c",
			"d",
		]);
	});
});

describe("shortSignalId", () => {
	it("keeps what comes after the app id", () => {
		expect(shortSignalId("signal-123-1f")).toBe("1f");
	});
});
