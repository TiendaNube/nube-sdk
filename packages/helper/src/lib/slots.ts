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
 * const shelves = dynamics.filter((slot) => slot.sectionType === "single-shelf");
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
 * @param sectionType - The theme section type (e.g. `"single-shelf"`)
 * @param position - Whether to target the slot before or after the section
 * @param order - Whether to target the first or the last section of the type
 */
async function findSectionSlot(
	sectionType: string,
	position: SectionPosition,
	order: SectionOrder,
): Promise<QuerySlotResult> {
	const slots = await getAvailableSlots();
	const dynamicType: DynamicSlot["type"] = `${position}_dynamic_section`;

	// find in dynamic slots: pick the lowest/highest sectionIndex among the
	// matching sections rather than assuming a fixed index.
	const candidates = slots.dynamic.filter(
		(slot) => slot.sectionType === sectionType && slot.type === dynamicType,
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

	// find in static slots (unique, so the same slot serves first and last)
	const staticSection = slots.static.find(
		(slot) => slot.slotId === `${position}_section_${sectionType}`,
	);

	if (staticSection) return staticSection;

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
 * @param sectionType - The theme section type (e.g. `"single-shelf"`)
 * @returns A promise resolving to the matching slot, or `null` when the page
 * has no such section
 * @throws If no NubeSDK instance was registered (see `setNubeInstance`)
 *
 * @example
 * ```typescript
 * // `ui.render` accepts the promise directly and skips rendering on `null`.
 * ui.render(beforeFirstSection("single-shelf"), component);
 * ```
 *
 * @since 0.3.0
 */
export function beforeFirstSection(
	sectionType: string,
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
 * @param sectionType - The theme section type (e.g. `"single-shelf"`)
 * @returns A promise resolving to the matching slot, or `null` when the page
 * has no such section
 * @throws If no NubeSDK instance was registered (see `setNubeInstance`)
 *
 * @example
 * ```typescript
 * const slot = await afterFirstSection("single-shelf");
 * if (slot) ui.render(slot, component);
 * ```
 *
 * @since 0.3.0
 */
export function afterFirstSection(
	sectionType: string,
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
 * @param sectionType - The theme section type (e.g. `"single-shelf"`)
 * @returns A promise resolving to the matching slot, or `null` when the page
 * has no such section
 * @throws If no NubeSDK instance was registered (see `setNubeInstance`)
 *
 * @example
 * ```typescript
 * ui.render(beforeLastSection("single-shelf"), component);
 * ```
 *
 * @since 0.3.0
 */
export function beforeLastSection(
	sectionType: string,
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
 * @param sectionType - The theme section type (e.g. `"single-shelf"`)
 * @returns A promise resolving to the matching slot, or `null` when the page
 * has no such section
 * @throws If no NubeSDK instance was registered (see `setNubeInstance`)
 *
 * @example
 * ```typescript
 * ui.render(afterLastSection("single-shelf"), component);
 * ```
 *
 * @since 0.3.0
 */
export function afterLastSection(
	sectionType: string,
): Promise<QuerySlotResult> {
	return findSectionSlot(sectionType, "after", "last");
}
