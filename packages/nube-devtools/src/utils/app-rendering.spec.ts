import { describe, expect, it } from "vitest";
import { summarizeAppRendering } from "./app-rendering";

const signal = (id: string) => ({
	type: "signal",
	__internalId: id,
	initialValue: 0,
});

describe("summarizeAppRendering", () => {
	it("lists the slots with content, sorted", () => {
		expect(
			summarizeAppRendering({
				corner_top_right: { type: "txt", children: "Hi" },
				before_main_content: { type: "box", children: [] },
				after_line_items: null,
			}).slots,
		).toEqual(["before_main_content", "corner_top_right"]);
	});

	it("counts distinct signals across slots", () => {
		const shared = signal("signal-app-1-1");
		expect(
			summarizeAppRendering({
				before_main_content: {
					type: "box",
					children: [
						{ type: "txt", children: ["Count: ", shared] },
						{ type: "txt", children: signal("signal-app-1-2") },
					],
				},
				after_line_items: { type: "txt", children: shared },
			}).signals,
		).toBe(2);
	});

	it("does not count signals of a cleared slot", () => {
		expect(summarizeAppRendering({ before_main_content: null }).signals).toBe(
			0,
		);
	});

	it("does not take a type: signal prop without an id for a signal", () => {
		expect(
			summarizeAppRendering({
				before_main_content: { type: "field", props: { type: "signal" } },
			}).signals,
		).toBe(0);
	});

	it("reads repeatable slots keyed by product", () => {
		expect(
			summarizeAppRendering({
				product_grid_item_name: {
					"1": { type: "txt", children: signal("signal-app-1-3") },
					"2": { type: "txt", children: "Sale" },
				},
			}),
		).toEqual({ slots: ["product_grid_item_name"], signals: 1 });
	});
});
