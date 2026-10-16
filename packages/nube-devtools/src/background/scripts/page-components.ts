/**
 * Injected into the inspected page's MAIN world to read the component trees
 * the apps render into their slots, and to point at them on the page.
 *
 * Each function is serialized by `executeScript` without its scope, so none
 * of them may reference anything declared outside its own body.
 */

/** Everything the Components page needs from the page, in one read. */
export type NubeSDKComponentsSnapshot = {
	/**
	 * `state.ui.slots`: what the `Slot`s actually render, with every app's
	 * contribution merged by the register.
	 */
	page: Record<string, unknown>;
	/** `state.apps[id].ui.slots`: what each app asked for, before the merge. */
	apps: Record<string, Record<string, unknown>>;
	/** `state.ui.values`, keyed by the component's `__internalId`. */
	values: Record<string, unknown>;
	/**
	 * How many `Slot` hosts (`<div data-slot>`) the page mounts per slot. A
	 * repeatable slot mounts one per product card; zero means the theme does
	 * not render that slot on this page.
	 */
	mounted: Record<string, number>;
};

/**
 * The slot trees, cloned through JSON: `executeScript` only hands back what
 * it can serialize, and the state is plain data anyway.
 */
export const readComponents = (): NubeSDKComponentsSnapshot | null => {
	const sdk = window.nubeSDK;
	if (typeof sdk?.getState !== "function") return null;

	try {
		const state = sdk.getState();

		const apps: Record<string, Record<string, unknown>> = {};
		for (const [appId, app] of Object.entries(state?.apps ?? {})) {
			const slots = (app as { ui?: { slots?: Record<string, unknown> } })?.ui
				?.slots;
			if (slots && Object.keys(slots).length > 0) apps[appId] = slots;
		}

		const mounted: Record<string, number> = {};
		for (const host of document.querySelectorAll("[data-slot]")) {
			const slot = host.getAttribute("data-slot");
			if (slot) mounted[slot] = (mounted[slot] ?? 0) + 1;
		}

		return JSON.parse(
			JSON.stringify({
				page: state?.ui?.slots ?? {},
				apps,
				values: state?.ui?.values ?? {},
				mounted,
			}),
		);
	} catch {
		return null;
	}
};

/**
 * Draws an overlay over the elements rendered for `ids`, or clears it when
 * `ids` is empty.
 *
 * `ids` is a node's id followed by its descendants' (see `domIdsOf`). An
 * element inside one already outlined is skipped, so a component that owns a
 * DOM element gets a single box, while one that renders none (a fragment, an
 * icon...) is outlined through its children. Every match of an id is
 * outlined, which is what a repeatable slot's hosts need.
 */
export const highlightComponents = (
	ids: string[],
	title: string,
	color: "green" | "blue",
): boolean => {
	const OVERLAY_ID = "nube-devtools-highlight";
	// Enough for a product grid's worth of slot hosts.
	const MAX_BOXES = 60;

	// Always clear the previous overlay so repeated hovers never stack or
	// leave a stale highlight behind.
	document.getElementById(OVERLAY_ID)?.remove();
	if (ids.length === 0) return true;

	const picked: Element[] = [];
	for (const id of ids) {
		if (picked.length >= MAX_BOXES) break;

		let matches: NodeListOf<Element>;
		try {
			// An attribute selector, unlike `#id`, matches every element sharing
			// the id, and `CSS.escape` keeps app-provided characters from
			// breaking the selector.
			matches = document.querySelectorAll(`[id="${CSS.escape(id)}"]`);
		} catch {
			continue;
		}

		for (const element of matches) {
			if (picked.length >= MAX_BOXES) break;
			// Not rendered (`display: none`, a closed popover...).
			if (element.getClientRects().length === 0) continue;
			if (picked.some((outlined) => outlined.contains(element))) continue;
			picked.push(element);
		}
	}

	if (picked.length === 0) return true;

	const border =
		color === "green"
			? "1px dashed rgba(124, 219, 110, 0.75)"
			: "1px dashed rgba(111, 168, 220, 0.75)";
	const background =
		color === "green"
			? "rgba(124, 219, 110, 0.15)"
			: "rgba(111, 168, 220, 0.15)";

	// `getBoundingClientRect()` is relative to the viewport, so a fixed
	// container needs no scroll math and does not depend on the page's
	// containing blocks.
	const overlay = document.createElement("div");
	overlay.id = OVERLAY_ID;
	overlay.style.position = "fixed";
	overlay.style.inset = "0";
	overlay.style.pointerEvents = "none";
	overlay.style.zIndex = "2147483647";

	picked.forEach((element, index) => {
		const rect = element.getBoundingClientRect();

		const box = document.createElement("div");
		box.style.position = "absolute";
		box.style.top = `${rect.top}px`;
		box.style.left = `${rect.left}px`;
		box.style.width = `${rect.width}px`;
		box.style.height = `${rect.height}px`;
		// Keep the border inside the rect so the box matches the element.
		box.style.boxSizing = "border-box";
		box.style.border = border;
		box.style.backgroundColor = background;
		overlay.appendChild(box);

		// One label is enough to say what is outlined.
		if (index !== 0) return;

		const label = document.createElement("div");
		label.style.position = "absolute";
		label.style.left = "0";
		// Below the element, unless that falls off the viewport.
		if (rect.bottom + 28 > window.innerHeight && rect.top > 28) {
			label.style.bottom = "calc(100% + 4px)";
		} else {
			label.style.top = "calc(100% + 4px)";
		}
		label.style.backgroundColor = "#4f4f4f";
		label.style.color = "white";
		label.style.padding = "4px 8px";
		label.style.borderRadius = "2px";
		label.style.whiteSpace = "nowrap";
		label.style.fontFamily = "monospace";
		label.style.fontSize = "11px";

		const name = document.createElement("strong");
		name.textContent = title;
		label.appendChild(name);

		const size = `${Math.round(rect.width)} × ${Math.round(rect.height)}`;
		const count = picked.length > 1 ? ` · ${picked.length} elements` : "";
		label.append(` ${size}${count}`);

		box.appendChild(label);
	});

	document.body.appendChild(overlay);
	return true;
};

/** Scrolls the first rendered element of `ids` (same order as above) into view. */
export const scrollToComponent = (ids: string[]): boolean => {
	for (const id of ids) {
		let matches: NodeListOf<Element>;
		try {
			matches = document.querySelectorAll(`[id="${CSS.escape(id)}"]`);
		} catch {
			continue;
		}

		for (const element of matches) {
			if (element.getClientRects().length === 0) continue;
			element.scrollIntoView({ behavior: "smooth", block: "center" });
			return true;
		}
	}
	return false;
};
