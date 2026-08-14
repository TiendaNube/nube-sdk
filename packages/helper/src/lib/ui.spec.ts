import type {
	DynamicSlot,
	NubeSDK,
	StaticSlot,
} from "@tiendanube/nube-sdk-types";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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
		vi.restoreAllMocks();
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

	describe("render", () => {
		const component = { type: "txt" as const, children: "hi" };
		const staticSlot = {
			slotId: "footer_seals",
			pick: null,
			isRepeatable: false,
		} as StaticSlot;
		const dynamicSlot = {
			type: "before_dynamic_section",
			sectionType: "single-shelf",
			sectionId: "single-shelf-1",
			sectionIndex: 1,
			slotId: "before_dynamic_section_single-shelf_1",
		} as DynamicSlot;

		it("delegates a slot name to the instance", () => {
			ui.render("before_main_content", component);
			expect(sdk.render).toHaveBeenCalledWith("before_main_content", component);
		});

		it("delegates a StaticSlot object to the instance", () => {
			ui.render(staticSlot, component);
			expect(sdk.render).toHaveBeenCalledWith(staticSlot, component);
		});

		it("delegates a DynamicSlot object to the instance", () => {
			ui.render(dynamicSlot, component);
			expect(sdk.render).toHaveBeenCalledWith(dynamicSlot, component);
		});

		it("renders the slot a resolved query promise yields", async () => {
			ui.render(Promise.resolve(dynamicSlot), component);

			await vi.waitFor(() =>
				expect(sdk.render).toHaveBeenCalledWith(dynamicSlot, component),
			);
		});

		it("does not render when the query promise resolves to null", async () => {
			ui.render(Promise.resolve(null), component);

			// flush microtasks so the promise chain settles
			await new Promise((resolve) => setTimeout(resolve, 0));

			expect(sdk.render).not.toHaveBeenCalled();
		});

		it("logs and swallows a rejected query promise instead of crashing", async () => {
			const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
			const failure = new Error("slot lookup failed");

			// must not throw synchronously
			expect(() => ui.render(Promise.reject(failure), component)).not.toThrow();

			await vi.waitFor(() => expect(errorSpy).toHaveBeenCalledWith(failure));
			expect(sdk.render).not.toHaveBeenCalled();
		});

		it("logs when the instance render throws inside the promise branch", async () => {
			const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
			const failure = new Error("render blew up");
			(sdk.render as ReturnType<typeof vi.fn>).mockImplementation(() => {
				throw failure;
			});

			ui.render(Promise.resolve(dynamicSlot), component);

			await vi.waitFor(() => expect(errorSpy).toHaveBeenCalledWith(failure));
		});
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
