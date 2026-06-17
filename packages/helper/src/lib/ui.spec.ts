import type { NubeSDK } from "@tiendanube/nube-sdk-types";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createMockSDK } from "../internal/test-utils.js";
import { clearNubeInstance, setNubeInstance } from "./instance.js";
import { ui } from "./ui.js";

describe("ui", () => {
	let sdk: NubeSDK;

	beforeEach(() => {
		sdk = createMockSDK();
		setNubeInstance(sdk);
	});

	afterEach(() => {
		clearNubeInstance();
	});

	describe("showToast", () => {
		it("renders a toast to corner_top_right with the given variant", () => {
			ui.showToast("Saved!", "success");

			expect(sdk.render).toHaveBeenCalledWith("corner_top_right", {
				type: "toastRoot",
				variant: "success",
				children: [{ type: "toastTitle", children: "Saved!" }],
			});
		});

		it("defaults the variant to info", () => {
			ui.showToast("Heads up");

			expect(sdk.render).toHaveBeenCalledWith(
				"corner_top_right",
				expect.objectContaining({ variant: "info" }),
			);
		});
	});

	it("clear delegates to clearSlot", () => {
		ui.clear("corner_top_left");
		expect(sdk.clearSlot).toHaveBeenCalledWith("corner_top_left");
	});

	it("render delegates to the instance", () => {
		const component = { type: "txt" as const, children: "hi" };
		ui.render("before_main_content", component);
		expect(sdk.render).toHaveBeenCalledWith("before_main_content", component);
	});

	describe("renderAll", () => {
		it("renders the same component across every slot", () => {
			const component = { type: "txt" as const, children: "x" };
			const slots = [
				"corner_top_left",
				"corner_top_right",
				"corner_bottom_left",
			] as const;

			ui.renderAll([...slots], component);

			expect(sdk.render).toHaveBeenCalledTimes(3);
			for (const slot of slots) {
				expect(sdk.render).toHaveBeenCalledWith(slot, component);
			}
		});
	});
});
