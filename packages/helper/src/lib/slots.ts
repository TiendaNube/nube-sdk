/**
 * @fileoverview Available-slots discovery helpers for NubeSDK
 *
 * The slots present on a page are not fixed: dynamic theme sections can be
 * added, removed or reordered by the store owner, so the same logical slot may
 * exist many times (or not at all). This module wraps
 * `nube.api.getAvailableSlots()` to answer the questions an app actually has —
 * "which slots exist here?" and "where is the first/last section of this
 * type?" — returning a slot ready to be passed to `ui.render`.
 */

import type {
	AvailableSlotsCommands,
	DynamicSlot,
	Nullable,
	StaticSlot,
} from "@tiendanube/nube-sdk-types";
import { getNubeInstance } from "./instance";

/**
 * The result of a slot query.
 *
 * A `DynamicSlot` when the section was found among the page's dynamic
 * sections, a `StaticSlot` when it was found as a fixed theme slot, or `null`
 * when the page exposes neither.
 *
 * @since 0.3.0
 */
export type QuerySlotResult = StaticSlot | DynamicSlot | null;

/**
 * The memoized available-slots adapter, resolved on first use by
 * {@link getAvailableSlotsAPI}. `null` until then.
 */
let api: Nullable<AvailableSlotsCommands> = null;

/**
 * Error describing a slot query that matched nothing on the current page.
 *
 * The query helpers do not throw it: they log it through {@link SlotNotFound.log}
 * and return `null`, so a missing slot degrades into "nothing rendered"
 * instead of breaking the app.
 *
 * @since 0.3.0
 */
export class SlotNotFound extends Error {
	/**
	 * @param queryDescription - Human-readable description of the query that
	 * failed (e.g. `"before first product-list section"`)
	 * @param appid - The id of the app that ran the query
	 */
	constructor(queryDescription: string, appid: string | number) {
		super(`There is no available slot ${queryDescription} for app ${appid}`);
	}

	/**
	 * Logs a `SlotNotFound` for the current app to the console.
	 *
	 * Reads the app id from `self.__APP_DATA__.id`, so it is meant to run inside
	 * the NubeSDK Web Worker runtime.
	 *
	 * @param queryDescription - Human-readable description of the query that
	 * failed
	 *
	 * @example
	 * ```typescript
	 * SlotNotFound.log("before first product-list section");
	 * // Error: There is no available slot before first product-list section for app 123
	 * ```
	 */
	static log(queryDescription: string) {
		console.error(new SlotNotFound(queryDescription, self.__APP_DATA__.id));
	}
}

/**
 * Gets the available-slots adapter from the registered NubeSDK instance.
 *
 * The adapter is resolved once and memoized for the lifetime of the app, so
 * repeated queries reuse the same command channel.
 *
 * @returns The available-slots adapter (`nube.api.getAvailableSlots()`)
 * @throws If no NubeSDK instance was registered (see `setNubeInstance`)
 *
 * @example
 * ```typescript
 * const slotsApi = getAvailableSlotsAPI();
 * const dynamics = await slotsApi.getDynamic();
 * ```
 *
 * @since 0.3.0
 */
export function getAvailableSlotsAPI() {
	if (api === null) {
		api = getNubeInstance().api.getAvailableSlots();
	}
	return api;
}

/**
 * Gets every slot available on the current page, split by kind.
 *
 * @returns A promise resolving to the page's `static` and `dynamic` slots
 * @throws If no NubeSDK instance was registered (see `setNubeInstance`)
 *
 * @example
 * ```typescript
 * const { static: statics, dynamic: dynamics } = await getAvailableSlots();
 * console.log(statics.length, dynamics.length);
 * ```
 *
 * @since 0.3.0
 */
export async function getAvailableSlots() {
	const slots = await getAvailableSlotsAPI().getAll();
	return slots;
}

/**
 * Gets only the static slots available on the current page.
 *
 * Static slots are the theme's fixed injection points, addressable by their
 * `slotId` alone.
 *
 * @returns A promise resolving to the page's static slots
 * @throws If no NubeSDK instance was registered (see `setNubeInstance`)
 *
 * @example
 * ```typescript
 * const statics = await getStaticSlots();
 * const hasFooterSeals = statics.some((slot) => slot.slotId === "footer_seals");
 * ```
 *
 * @since 0.3.0
 */
export async function getStaticSlots() {
	const slots = await getAvailableSlotsAPI().getStatic();
	return slots;
}

/**
 * Gets only the dynamic slots available on the current page.
 *
 * Each dynamic slot carries the coordinates of its theme section
 * (`sectionType`, `sectionId`, `sectionIndex`), which is what lets an app pick
 * a specific instance when a section repeats.
 *
 * @returns A promise resolving to the page's dynamic slots
 * @throws If no NubeSDK instance was registered (see `setNubeInstance`)
 *
 * @example
 * ```typescript
 * const dynamics = await getDynamicSlots();
 * // raw slots carry the section's own name, so no alias resolution happens here
 * const featured = dynamics.filter(
 * 	(slot) => slot.sectionType === "featured_products",
 * );
 * ```
 *
 * @since 0.3.0
 */
export async function getDynamicSlots() {
	const slots = await getAvailableSlotsAPI().getDynamic();
	return slots;
}

/** Whether a query targets the slot before or after a section. */
type SectionPosition = "before" | "after";

/** Whether a query targets the first or the last section of a type. */
type SectionOrder = "first" | "last";

/**
 * Section types that name the same logical theme section under different
 * spellings.
 *
 * The static slots were named after the section they wrap (`products_featured`)
 * while the dynamic sections are named after the page data that feeds them
 * (`featured_products`), so the same section answers to two names depending on
 * whether the theme renders it as a fixed or as a dynamic section. Each entry
 * is an equivalence class: every name in it refers to one section, so a query
 * for any of them must consider all of them.
 *
 * Private on purpose — apps keep passing whichever name they know and the
 * lookup normalizes it. To teach the helpers a new pair, add a group here.
 */
const EQUIVALENT_SECTION_TYPES = [
	["featured_products", "products_featured"],
] as const;

/**
 * Section types the SDK knows about: the static section-boundary slots the
 * theme exposes, plus the equivalence aliases (see
 * {@link EQUIVALENT_SECTION_TYPES}, kept derived so the table stays the single
 * source of truth).
 */
type KnownSectionType =
	| "newsletter"
	| "products_sale"
	| "products_new"
	| "products_featured"
	| (typeof EQUIVALENT_SECTION_TYPES)[number][number];

/**
 * A theme section type.
 *
 * Known section types (`newsletter`, `products_featured`, …) are surfaced as
 * editor autocomplete, while any other string is still accepted to support
 * custom and dynamic sections whose names are only known at runtime.
 *
 * @since 0.3.0
 */
export type SectionType = KnownSectionType | (string & {});

/**
 * Index from a section type to its equivalence class in
 * {@link EQUIVALENT_SECTION_TYPES}, built once at module load so a query is a
 * single map lookup.
 */
const equivalenceIndex = new Map<string, readonly string[]>(
	EQUIVALENT_SECTION_TYPES.flatMap((group) =>
		group.map((sectionType) => [sectionType, group] as const),
	),
);

/**
 * Expands a section type into every name that refers to the same section.
 *
 * The queried name always comes first, so static lookups keep preferring the
 * spelling the app asked for; unknown section types expand to themselves.
 *
 * @param sectionType - The theme section type as the app spelled it
 * @returns The section type followed by its known aliases
 */
function getEquivalentSectionTypes(sectionType: string): readonly string[] {
	const group = equivalenceIndex.get(sectionType);
	if (!group) return [sectionType];
	return [sectionType, ...group.filter((alias) => alias !== sectionType)];
}

/**
 * Shared implementation behind the four section-query helpers.
 *
 * Dynamic sections are searched first: it filters the page's dynamic slots by
 * `sectionType` and position, then picks the one with the lowest
 * (`"first"`) or highest (`"last"`) `sectionIndex`. This is robust to how many
 * sections of the type exist and to their position among the page's other
 * dynamic sections. When the theme has no matching dynamic section, it falls
 * back to the unique static `${position}_section_${sectionType}` slot. When
 * neither exists, it logs a {@link SlotNotFound} and resolves to `null`.
 *
 * Both searches run over the section type and its aliases (see
 * {@link EQUIVALENT_SECTION_TYPES}), so a section that is spelled one way as a
 * static slot and another as a dynamic one is found under either name.
 *
 * @param sectionType - The theme section type (e.g. `"products_featured"`)
 * @param position - Whether to target the slot before or after the section
 * @param order - Whether to target the first or the last section of the type
 */
async function findSectionSlot(
	sectionType: SectionType,
	position: SectionPosition,
	order: SectionOrder,
): Promise<QuerySlotResult> {
	const slots = await getAvailableSlots();
	const dynamicType: DynamicSlot["type"] = `${position}_dynamic_section`;
	const sectionTypes = getEquivalentSectionTypes(sectionType);

	// find in dynamic slots: pick the lowest/highest sectionIndex among the
	// matching sections rather than assuming a fixed index.
	const candidates = slots.dynamic.filter(
		(slot) =>
			sectionTypes.includes(slot.sectionType) && slot.type === dynamicType,
	);

	if (candidates.length > 0) {
		const dynamicSection = candidates.reduce((selected, slot) =>
			order === "first"
				? slot.sectionIndex < selected.sectionIndex
					? slot
					: selected
				: slot.sectionIndex > selected.sectionIndex
					? slot
					: selected,
		);
		return dynamicSection;
	}

	// find in static slots (unique, so the same slot serves first and last),
	// trying the queried spelling before its aliases
	for (const type of sectionTypes) {
		const staticSection = slots.static.find(
			(slot) => slot.slotId === `${position}_section_${type}`,
		);
		if (staticSection) return staticSection;
	}

	SlotNotFound.log(`${position} ${order} ${sectionType} section`);
	return null;
}

/**
 * Finds the slot placed right before the first section of the given type.
 *
 * Dynamic sections are searched first; if the theme has no dynamic section of
 * that type, it falls back to the static `before_section_${sectionType}` slot.
 * When neither exists, it logs a {@link SlotNotFound} and resolves to `null`.
 *
 * @param sectionType - The theme section type (e.g. `"products_featured"`)
 * @returns A promise resolving to the matching slot, or `null` when the page
 * has no such section
 * @throws If no NubeSDK instance was registered (see `setNubeInstance`)
 *
 * @example
 * ```typescript
 * // `ui.render` accepts the promise directly and skips rendering on `null`.
 * ui.render(beforeFirstSection("products_featured"), component);
 * ```
 *
 * @since 0.3.0
 */
export function beforeFirstSection(
	sectionType: SectionType,
): Promise<QuerySlotResult> {
	return findSectionSlot(sectionType, "before", "first");
}

/**
 * Finds the slot placed right after the first section of the given type.
 *
 * Dynamic sections are searched first; if the theme has no dynamic section of
 * that type, it falls back to the static `after_section_${sectionType}` slot.
 * When neither exists, it logs a {@link SlotNotFound} and resolves to `null`.
 *
 * @param sectionType - The theme section type (e.g. `"products_featured"`)
 * @returns A promise resolving to the matching slot, or `null` when the page
 * has no such section
 * @throws If no NubeSDK instance was registered (see `setNubeInstance`)
 *
 * @example
 * ```typescript
 * const slot = await afterFirstSection("products_featured");
 * if (slot) ui.render(slot, component);
 * ```
 *
 * @since 0.3.0
 */
export function afterFirstSection(
	sectionType: SectionType,
): Promise<QuerySlotResult> {
	return findSectionSlot(sectionType, "after", "first");
}

/**
 * Finds the slot placed right before the last section of the given type.
 *
 * Dynamic sections are searched first; if the theme has no matching dynamic
 * section, it falls back to the static `before_section_${sectionType}` slot
 * (which is unique, so it is the same slot {@link beforeFirstSection} returns).
 * When neither exists, it logs a {@link SlotNotFound} and resolves to `null`.
 *
 * @param sectionType - The theme section type (e.g. `"products_featured"`)
 * @returns A promise resolving to the matching slot, or `null` when the page
 * has no such section
 * @throws If no NubeSDK instance was registered (see `setNubeInstance`)
 *
 * @example
 * ```typescript
 * ui.render(beforeLastSection("products_featured"), component);
 * ```
 *
 * @since 0.3.0
 */
export function beforeLastSection(
	sectionType: SectionType,
): Promise<QuerySlotResult> {
	return findSectionSlot(sectionType, "before", "last");
}

/**
 * Finds the slot placed right after the last section of the given type.
 *
 * Dynamic sections are searched first; if the theme has no matching dynamic
 * section, it falls back to the static `after_section_${sectionType}` slot
 * (which is unique, so it is the same slot {@link afterFirstSection} returns).
 * When neither exists, it logs a {@link SlotNotFound} and resolves to `null`.
 *
 * @param sectionType - The theme section type (e.g. `"products_featured"`)
 * @returns A promise resolving to the matching slot, or `null` when the page
 * has no such section
 * @throws If no NubeSDK instance was registered (see `setNubeInstance`)
 *
 * @example
 * ```typescript
 * ui.render(afterLastSection("products_featured"), component);
 * ```
 *
 * @since 0.3.0
 */
export function afterLastSection(
	sectionType: SectionType,
): Promise<QuerySlotResult> {
	return findSectionSlot(sectionType, "after", "last");
}
