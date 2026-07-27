import type {
	AvailableSlotsCommands,
	DynamicSlot,
	NubeSDK,
	StaticSlot,
} from "@tiendanube/nube-sdk-types";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMockSDK } from "../internal/test-utils.js";

/** The available-slots payload returned by `getAll` / `getStatic` / `getDynamic`. */
type SlotsPayload = { static: StaticSlot[]; dynamic: DynamicSlot[] };

/** The dynamically-imported `slots` module (fresh per test, see {@link setup}). */
type SlotsModule = typeof import("./slots.js");

interface GlobalWithAppData {
	self: { __APP_DATA__: { id: string; script: string } };
}

/** Builds a `DynamicSlot` for `sectionType` at `sectionIndex`, before or after. */
function dynamicSlot(
	sectionType: string,
	sectionIndex: number,
	type: DynamicSlot["type"],
): DynamicSlot {
	return {
		type,
		sectionType,
		sectionId: `${sectionType}-${sectionIndex}`,
		sectionIndex,
		slotId: `${type}_${sectionType}_${sectionIndex}`,
	} as DynamicSlot;
}

/** Builds a non-repeatable `StaticSlot` with the given `slotId`. */
function staticSlot(slotId: string): StaticSlot {
	return { slotId, pick: null, isRepeatable: false } as StaticSlot;
}

/**
 * Resets the module graph (so `slots.ts` starts with its `api` memo cleared),
 * registers a mock SDK whose available-slots adapter serves `payload`, and
 * returns the freshly-imported module together with the adapter spy.
 */
async function setup(
	payload: SlotsPayload = { static: [], dynamic: [] },
): Promise<{
	slots: SlotsModule;
	commands: AvailableSlotsCommands;
	getAvailableSlotsSpy: ReturnType<typeof vi.fn>;
}> {
	vi.resetModules();
	const instance = await import("./instance.js");
	const slots = await import("./slots.js");

	const commands: AvailableSlotsCommands = {
		getAll: vi.fn(async () => payload),
		getStatic: vi.fn(async () => payload.static),
		getDynamic: vi.fn(async () => payload.dynamic),
	};
	const getAvailableSlotsSpy = vi.fn(() => commands);
	const sdk = {
		...createMockSDK(),
		api: {
			getAvailableSlots: getAvailableSlotsSpy,
			getCheckout: vi.fn(),
			getAnalytics: vi.fn(),
		},
	} as unknown as NubeSDK;

	instance.setNubeInstance(sdk);

	return { slots, commands, getAvailableSlotsSpy };
}

describe("slots", () => {
	beforeEach(() => {
		(globalThis as unknown as GlobalWithAppData).self = {
			__APP_DATA__: { id: "app-123", script: "https://cdn.example.com/app.js" },
		};
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("getAvailableSlotsAPI", () => {
		it("throws when no NubeSDK instance is registered", async () => {
			vi.resetModules();
			const slots = await import("./slots.js");

			expect(() => slots.getAvailableSlotsAPI()).toThrow(/setNubeInstance/);
		});

		it("memoizes the adapter, resolving it only once", async () => {
			const { slots, commands, getAvailableSlotsSpy } = await setup();

			const first = slots.getAvailableSlotsAPI();
			const second = slots.getAvailableSlotsAPI();

			expect(first).toBe(commands);
			expect(second).toBe(commands);
			expect(getAvailableSlotsSpy).toHaveBeenCalledTimes(1);
		});
	});

	describe("bucket getters", () => {
		it("getAvailableSlots returns both buckets via getAll", async () => {
			const payload: SlotsPayload = {
				static: [staticSlot("footer_seals")],
				dynamic: [dynamicSlot("single-shelf", 1, "before_dynamic_section")],
			};
			const { slots, commands } = await setup(payload);

			await expect(slots.getAvailableSlots()).resolves.toEqual(payload);
			expect(commands.getAll).toHaveBeenCalledTimes(1);
		});

		it("getStaticSlots returns only the static bucket via getStatic", async () => {
			const statics = [staticSlot("footer_seals")];
			const { slots, commands } = await setup({ static: statics, dynamic: [] });

			await expect(slots.getStaticSlots()).resolves.toEqual(statics);
			expect(commands.getStatic).toHaveBeenCalledTimes(1);
		});

		it("getDynamicSlots returns only the dynamic bucket via getDynamic", async () => {
			const dynamics = [
				dynamicSlot("single-shelf", 1, "before_dynamic_section"),
			];
			const { slots, commands } = await setup({
				static: [],
				dynamic: dynamics,
			});

			await expect(slots.getDynamicSlots()).resolves.toEqual(dynamics);
			expect(commands.getDynamic).toHaveBeenCalledTimes(1);
		});
	});

	describe("beforeFirstSection", () => {
		it("returns the before-slot of the lowest-index matching section", async () => {
			const wanted = dynamicSlot("single-shelf", 2, "before_dynamic_section");
			const { slots } = await setup({
				static: [],
				dynamic: [
					dynamicSlot("single-shelf", 5, "before_dynamic_section"),
					wanted,
					dynamicSlot("single-shelf", 2, "after_dynamic_section"),
				],
			});

			await expect(slots.beforeFirstSection("single-shelf")).resolves.toBe(
				wanted,
			);
		});

		it("finds the section even when it is not the first dynamic section on the page", async () => {
			const wanted = dynamicSlot("single-shelf", 2, "before_dynamic_section");
			const { slots } = await setup({
				static: [],
				dynamic: [dynamicSlot("banner", 1, "before_dynamic_section"), wanted],
			});

			await expect(slots.beforeFirstSection("single-shelf")).resolves.toBe(
				wanted,
			);
		});

		it("falls back to the static before_section_${type} slot", async () => {
			const fallback = staticSlot("before_section_single-shelf");
			const { slots } = await setup({ static: [fallback], dynamic: [] });

			await expect(slots.beforeFirstSection("single-shelf")).resolves.toBe(
				fallback,
			);
		});

		it("logs SlotNotFound and resolves null when nothing matches", async () => {
			const { slots } = await setup();
			const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

			await expect(
				slots.beforeFirstSection("single-shelf"),
			).resolves.toBeNull();

			const error = errorSpy.mock.calls[0]?.[0] as Error;
			expect(error).toBeInstanceOf(slots.SlotNotFound);
			expect(error.message).toBe(
				"There is no available slot before first single-shelf section for app app-123",
			);
		});
	});

	describe("afterFirstSection", () => {
		it("returns the after-slot of the lowest-index matching section", async () => {
			const wanted = dynamicSlot("single-shelf", 2, "after_dynamic_section");
			const { slots } = await setup({
				static: [],
				dynamic: [
					dynamicSlot("single-shelf", 2, "before_dynamic_section"),
					dynamicSlot("single-shelf", 5, "after_dynamic_section"),
					wanted,
				],
			});

			await expect(slots.afterFirstSection("single-shelf")).resolves.toBe(
				wanted,
			);
		});

		it("falls back to the static after_section_${type} slot", async () => {
			const fallback = staticSlot("after_section_single-shelf");
			const { slots } = await setup({ static: [fallback], dynamic: [] });

			await expect(slots.afterFirstSection("single-shelf")).resolves.toBe(
				fallback,
			);
		});

		it("logs SlotNotFound and resolves null when nothing matches", async () => {
			const { slots } = await setup();
			const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

			await expect(slots.afterFirstSection("single-shelf")).resolves.toBeNull();

			const error = errorSpy.mock.calls[0]?.[0] as Error;
			expect(error.message).toBe(
				"There is no available slot after first single-shelf section for app app-123",
			);
		});
	});

	describe("beforeLastSection", () => {
		it("returns the before-slot of the highest-index matching section", async () => {
			// Regression: two sections of the same type produce four dynamic slots,
			// so the old `sectionIndex === dynamic.length - 1` check (=== 3) matched
			// nothing. The last section here is index 5, not 3.
			const wanted = dynamicSlot("single-shelf", 5, "before_dynamic_section");
			const { slots } = await setup({
				static: [],
				dynamic: [
					dynamicSlot("single-shelf", 2, "before_dynamic_section"),
					dynamicSlot("single-shelf", 2, "after_dynamic_section"),
					wanted,
					dynamicSlot("single-shelf", 5, "after_dynamic_section"),
				],
			});

			await expect(slots.beforeLastSection("single-shelf")).resolves.toBe(
				wanted,
			);
		});

		it("ignores sections of other types when picking the last one", async () => {
			const wanted = dynamicSlot("single-shelf", 3, "before_dynamic_section");
			const { slots } = await setup({
				static: [],
				dynamic: [wanted, dynamicSlot("banner", 9, "before_dynamic_section")],
			});

			await expect(slots.beforeLastSection("single-shelf")).resolves.toBe(
				wanted,
			);
		});

		it("falls back to the static before_section_${type} slot", async () => {
			const fallback = staticSlot("before_section_single-shelf");
			const { slots } = await setup({ static: [fallback], dynamic: [] });

			await expect(slots.beforeLastSection("single-shelf")).resolves.toBe(
				fallback,
			);
		});

		it("logs SlotNotFound and resolves null when nothing matches", async () => {
			const { slots } = await setup();
			const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

			await expect(slots.beforeLastSection("single-shelf")).resolves.toBeNull();

			const error = errorSpy.mock.calls[0]?.[0] as Error;
			expect(error.message).toBe(
				"There is no available slot before last single-shelf section for app app-123",
			);
		});
	});

	describe("afterLastSection", () => {
		it("returns the after-slot of the highest-index matching section", async () => {
			const wanted = dynamicSlot("single-shelf", 5, "after_dynamic_section");
			const { slots } = await setup({
				static: [],
				dynamic: [
					dynamicSlot("single-shelf", 2, "after_dynamic_section"),
					dynamicSlot("single-shelf", 5, "before_dynamic_section"),
					wanted,
				],
			});

			await expect(slots.afterLastSection("single-shelf")).resolves.toBe(
				wanted,
			);
		});

		it("falls back to the static after_section_${type} slot", async () => {
			const fallback = staticSlot("after_section_single-shelf");
			const { slots } = await setup({ static: [fallback], dynamic: [] });

			await expect(slots.afterLastSection("single-shelf")).resolves.toBe(
				fallback,
			);
		});

		it("logs SlotNotFound and resolves null when nothing matches", async () => {
			const { slots } = await setup();
			const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

			await expect(slots.afterLastSection("single-shelf")).resolves.toBeNull();

			const error = errorSpy.mock.calls[0]?.[0] as Error;
			expect(error.message).toBe(
				"There is no available slot after last single-shelf section for app app-123",
			);
		});
	});

	describe("dynamic search precedence", () => {
		it("prefers a matching dynamic slot over the static fallback", async () => {
			const dynamicMatch = dynamicSlot(
				"single-shelf",
				1,
				"before_dynamic_section",
			);
			const { slots } = await setup({
				static: [staticSlot("before_section_single-shelf")],
				dynamic: [dynamicMatch],
			});

			await expect(slots.beforeFirstSection("single-shelf")).resolves.toBe(
				dynamicMatch,
			);
		});

		it("does not match a dynamic slot of the wrong position", async () => {
			const fallback = staticSlot("before_section_single-shelf");
			const { slots } = await setup({
				static: [fallback],
				// only an after-slot exists; beforeFirstSection must not return it
				dynamic: [dynamicSlot("single-shelf", 1, "after_dynamic_section")],
			});

			await expect(slots.beforeFirstSection("single-shelf")).resolves.toBe(
				fallback,
			);
		});
	});

	describe("SlotNotFound", () => {
		it("formats its message from the query description and app id", async () => {
			const { slots } = await setup();

			const error = new slots.SlotNotFound("before first x section", 42);

			expect(error).toBeInstanceOf(Error);
			expect(error.message).toBe(
				"There is no available slot before first x section for app 42",
			);
		});

		it("log reads the app id from self.__APP_DATA__.id", async () => {
			const { slots } = await setup();
			const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

			slots.SlotNotFound.log("after last y section");

			const error = errorSpy.mock.calls[0]?.[0] as Error;
			expect(error.message).toBe(
				"There is no available slot after last y section for app app-123",
			);
		});
	});
});
