import type { CheckoutUISlot, DynamicUISlot, StorefrontUISlot } from "./slots";
import type { Prettify } from "./utility";

/**
 * A static slot present on the current page — the richer shape returned by
 * {@link AvailableSlotsCommands.getStatic}.
 *
 * `pick` is what differentiates a repeatable slot (product-grid items, line
 * items) from a non-repeatable one, so it is promoted into the type alongside
 * the derived {@link StaticSlot.isRepeatable} flag.
 */
export type StaticSlot = {
	/**
	 * The slot name (a known checkout/storefront slot, not an arbitrary
	 * string). This is also the key under which `render` writes the slot into
	 * `NubeSDKState["ui"]["slots"]`.
	 */
	slotId: Prettify<CheckoutUISlot | StorefrontUISlot>;
	/**
	 * Disambiguation key for repeatable static slots (e.g. `product.id` for
	 * product-grid items, or the line-item id). `null` for non-repeatable
	 * slots.
	 */
	pick: string | null;
	/**
	 * Whether the slot is repeatable. Auto-calculated: a slot is repeatable iff
	 * it carries a `pick` (`isRepeatable === (pick !== null)`), so consumers
	 * read it directly instead of re-deriving it.
	 */
	isRepeatable: boolean;
};

/**
 * The two dynamic-section slot prefixes (without the trailing `_`), used as the
 * {@link DynamicSlot.type} discriminant.
 */
export type DynamicSlotType =
	| "before_dynamic_section"
	| "after_dynamic_section";

/**
 * A dynamic slot present on the current page — the richer shape returned by
 * {@link AvailableSlotsCommands.getDynamic}.
 *
 * A dynamic slot is injected around a theme section that the store owner can
 * add, remove or reorder, so the same logical slot can exist many times on a
 * page (one instance per section). It carries the section's coordinates so an
 * app can find the instance it wants (e.g.
 * `dynamics.find(s => s.sectionType === "product-list")`); `slotId` is the
 * addressable name it then passes to `render` / `clearSlot`.
 */
export type DynamicSlot = {
	/** Whether the slot sits before or after its dynamic section. */
	type: DynamicSlotType;
	/** The section's type (e.g. `"product-list"`). */
	sectionType: string;
	/** The section instance id generated when the page is built. */
	sectionId: string;
	/** The section's position among the page's dynamic sections. */
	sectionIndex: number;
	/**
	 * The dynamic slot's name — a {@link DynamicUISlot} built from the section
	 * coordinates. This is the key under which `render` writes the slot into
	 * `NubeSDKState["ui"]["slots"]`.
	 */
	slotId: DynamicUISlot;
};

/**
 * Adapter exposed on `NubeSDK` as `nube.api.getAvailableSlots()`. Lets an app
 * discover the slots present on the current page — both static and dynamic —
 * so it can render into them (see {@link DynamicSlot} for why dynamic slots
 * need discovery).
 *
 * The methods are `async` because the data lives on the main thread (the DOM)
 * and is fetched across the worker / main thread boundary via the internal
 * command channel.
 */
export type AvailableSlotsCommands = {
	/** Returns only the static slots present on the current page. */
	getStatic(): Promise<StaticSlot[]>;
	/**
	 * Returns only the dynamic slots present on the current page, each carrying
	 * its section coordinates.
	 */
	getDynamic(): Promise<DynamicSlot[]>;
	/** Returns both buckets at once — the whole available-slots registry. */
	getAll(): Promise<{ static: StaticSlot[]; dynamic: DynamicSlot[] }>;
};
