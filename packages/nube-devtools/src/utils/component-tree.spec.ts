import { describe, expect, it } from "vitest";
import type { NubeSDKComponentsSnapshot } from "../background/scripts/page-components";
import {
	PAGE_VIEW,
	ancestorKeys,
	buildComponentTree,
	componentName,
	countComponents,
	domIdsOf,
	filterTree,
	findNode,
	nodeForDomIds,
} from "./component-tree";

function snapshot(
	partial: Partial<NubeSDKComponentsSnapshot>,
): NubeSDKComponentsSnapshot {
	return { page: {}, apps: {}, values: {}, mounted: {}, ...partial };
}

/** Two apps sharing a regular slot, as the register stores it. */
const sharedSlot = snapshot({
	apps: {
		"123": {
			before_main_content: [
				{ type: "txt", __internalId: "txt-123-a", children: "oi" },
				{ type: "txt", __internalId: "txt-123-b", children: "hola" },
			],
		},
		"456": {
			before_main_content: {
				type: "box",
				__internalId: "box-456-a",
				children: [
					"bye ",
					{ type: "txt", __internalId: "txt-456-b", children: "!" },
				],
			},
		},
	},
	page: {
		before_main_content: {
			type: "fragment",
			children: [
				{ type: "txt", __internalId: "txt-123-a", children: "oi" },
				{ type: "txt", __internalId: "txt-123-b", children: "hola" },
				{
					type: "box",
					__internalId: "box-456-a",
					children: [
						"bye ",
						{ type: "txt", __internalId: "txt-456-b", children: "!" },
					],
				},
			],
		},
	},
	mounted: { before_main_content: 1 },
});

/** A repeatable slot: one keyed entry per product, merged per key. */
const repeatableSlot = snapshot({
	apps: {
		"123": {
			product_grid_item_image_bottom_left: {
				p1: { type: "txt", __internalId: "txt-123-p1", children: "💙" },
				p2: { type: "txt", __internalId: "txt-123-p2", children: "❤️" },
			},
		},
		"456": {
			product_grid_item_image_bottom_left: {
				p2: { type: "txt", __internalId: "txt-456-p2", children: "🧡" },
			},
		},
	},
	page: {
		product_grid_item_image_bottom_left: {
			p1: { type: "txt", __internalId: "txt-123-p1", children: "💙" },
			p2: {
				type: "fragment",
				children: [
					{ type: "txt", __internalId: "txt-123-p2", children: "❤️" },
					{ type: "txt", __internalId: "txt-456-p2", children: "🧡" },
				],
			},
		},
	},
	mounted: { product_grid_item_image_bottom_left: 12 },
});

describe("componentName", () => {
	it("uses the JSX name of abbreviated types", () => {
		expect(componentName("txt")).toBe("Text");
		expect(componentName("col")).toBe("Column");
		expect(componentName("check")).toBe("Checkbox");
		expect(componentName("videoStories")).toBe("VideoStories");
	});

	it("renders namespaced types as JSX members", () => {
		expect(componentName("formField")).toBe("Form.Field");
		expect(componentName("accordionRoot")).toBe("Accordion.Root");
		expect(componentName("svgFeGaussianBlur")).toBe("Svg.FeGaussianBlur");
		expect(componentName("videoYouTube")).toBe("Video.YouTube");
	});

	it("capitalizes anything else, including types it does not know", () => {
		expect(componentName("box")).toBe("Box");
		expect(componentName("brandNewThing")).toBe("BrandNewThing");
	});
});

describe("buildComponentTree — app view", () => {
	it("lists every component of an array slot", () => {
		const [slot] = buildComponentTree(sharedSlot, "123");

		expect(slot?.kind).toBe("slot");
		expect(slot?.children.map((node) => node.id)).toEqual([
			"txt-123-a",
			"txt-123-b",
		]);
		expect(slot?.children.every((node) => node.app === "123")).toBe(true);
	});

	it("keeps text children as text nodes", () => {
		const [slot] = buildComponentTree(sharedSlot, "456");
		const box = slot?.children[0];

		expect(box?.name).toBe("Box");
		expect(box?.children.map((node) => [node.kind, node.name])).toEqual([
			["text", "bye "],
			["component", "Text"],
		]);
	});

	it("tags repeatable entries with their key", () => {
		const [slot] = buildComponentTree(repeatableSlot, "123");

		expect(slot?.repeatable).toBe(true);
		expect(slot?.children.map((node) => node.entryKey)).toEqual(["p1", "p2"]);
	});

	it("leaves the component's own props, and nothing else, in props", () => {
		const tree = buildComponentTree(
			snapshot({
				apps: {
					a: {
						s: {
							type: "field",
							__internalId: "field-a-1",
							key: "email",
							name: "email",
							label: "E-mail",
							children: "ignored",
						},
					},
				},
			}),
			"a",
		);
		const field = tree[0]?.children[0];

		expect(field?.componentKey).toBe("email");
		expect(field?.props).toEqual({ name: "email", label: "E-mail" });
	});
});

describe("buildComponentTree — page view", () => {
	it("replaces the register's merge fragment with what it merged", () => {
		const [slot] = buildComponentTree(sharedSlot, PAGE_VIEW);

		expect(slot?.children.map((node) => node.type)).toEqual([
			"txt",
			"txt",
			"box",
		]);
	});

	it("attributes each node to the app that sent it", () => {
		const [slot] = buildComponentTree(sharedSlot, PAGE_VIEW);

		expect(slot?.children.map((node) => node.app)).toEqual([
			"123",
			"123",
			"456",
		]);
		expect(slot?.apps).toEqual(["123", "456"]);
	});

	it("keeps the entry key on what a repeatable entry merged", () => {
		const [slot] = buildComponentTree(repeatableSlot, PAGE_VIEW);

		expect(
			slot?.children.map((node) => [node.entryKey, node.app, node.name]),
		).toEqual([
			["p1", "123", "Text"],
			["p2", "123", "Text"],
			["p2", "456", "Text"],
		]);
		expect(slot?.mounted).toBe(12);
	});

	it("keeps a fragment the app declared itself", () => {
		const tree = buildComponentTree(
			snapshot({
				page: {
					s: {
						type: "fragment",
						__internalId: "fragment-a-1",
						children: [{ type: "txt", __internalId: "txt-a-1" }],
					},
				},
			}),
			PAGE_VIEW,
		);

		expect(tree[0]?.children[0]?.name).toBe("Fragment");
	});

	it("reports slots the page does not mount", () => {
		const tree = buildComponentTree(
			snapshot({ page: { s: { type: "txt", __internalId: "t" } } }),
			PAGE_VIEW,
		);

		expect(tree[0]?.mounted).toBe(0);
	});

	it("skips empty slots and sorts the rest", () => {
		const tree = buildComponentTree(
			snapshot({
				page: {
					zeta: { type: "txt", __internalId: "z" },
					empty: [],
					alpha: { type: "txt", __internalId: "a" },
				},
			}),
			PAGE_VIEW,
		);

		expect(tree.map((node) => node.name)).toEqual(["alpha", "zeta"]);
	});
});

describe("tree helpers", () => {
	const tree = buildComponentTree(sharedSlot, PAGE_VIEW);

	it("lists a node's DOM id before its descendants'", () => {
		const box = tree[0]?.children[2];
		expect(box && domIdsOf(box)).toEqual(["box-456-a", "txt-456-b"]);
		expect(tree[0] && domIdsOf(tree[0])[0]).toBe(
			"nube-sdk-slot-before_main_content",
		);
	});

	it("finds a node and its ancestors by key", () => {
		const inner = tree[0]?.children[2]?.children[1];
		if (!inner) throw new Error("fixture changed");

		expect(findNode(tree, inner.key)).toBe(inner);
		expect(ancestorKeys(tree, inner.key)).toEqual([
			tree[0]?.key,
			tree[0]?.children[2]?.key,
		]);
		expect(ancestorKeys(tree, "missing")).toBeNull();
	});

	it("maps an element's ids, innermost first, to its component", () => {
		expect(
			nodeForDomIds(tree, [
				"some-theme-id",
				"txt-456-b",
				"box-456-a",
				"nube-sdk-slot-before_main_content",
			])?.id,
		).toBe("txt-456-b");
		expect(
			nodeForDomIds(tree, ["nube-sdk-slot-before_main_content"]),
		).toBeNull();
	});

	it("filters to matches and the path leading to them", () => {
		const filtered = filterTree(tree, "box");

		expect(filtered).toHaveLength(1);
		expect(filtered[0]?.children.map((node) => node.id)).toEqual(["box-456-a"]);
		// A match keeps its subtree.
		expect(filtered[0]?.children[0]?.children).toHaveLength(2);
		expect(filterTree(tree, "  ")).toBe(tree);
	});

	it("counts components, not text", () => {
		expect(countComponents(tree)).toBe(4);
	});
});
