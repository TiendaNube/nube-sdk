/**
 * "Show slots" from the Components page: renders the name of every slot the
 * page offers inside that slot, so a developer can see where each one is.
 *
 * Registered by the service worker to run at `document_start` in the MAIN
 * world, and a no-op unless the Components page turned the toggle on (a flag
 * in the page's `sessionStorage`). The toggle reloads the page, so the slots
 * are only ever drawn from a clean start and never have to be removed.
 *
 * It behaves like an app without being one: there is no worker, but what it
 * renders is kept under its own entry in `state.apps` (`APP_ID`), exactly
 * where the register keeps an app's UI. The register merges every entry of
 * `state.apps` into `state.ui.slots` whenever an app renders, so the labels
 * survive the apps' renders and theirs survive ours. Since this script does
 * not go through the register, it does that same merge itself (see
 * `mergeSlots`, which mirrors `handleSlotSet` in nube-sdk-internal).
 *
 * The slot list comes from the host (`AvailableSlots` commands) where it has
 * one. Checkout and the Patagonia theme do not, so they get a fixed list,
 * the same fallback the minimal-slot-display sample app uses.
 *
 * Hovering a label shows the full slot name (labels of the small image slots
 * are shortened) and, for a repeatable slot, what its pick refers to. The SDK
 * components have no tooltip of their own, so the card is drawn here, found
 * through the label's DOM id (every component renders its `__internalId` as
 * its id).
 *
 * The flag key and `APP_ID` are duplicated in `src/utils/show-slots.ts`: this
 * file is served as is, so they have to be kept in sync by hand.
 */
(() => {
	const FLAG_KEY = "nube-devtools-show-slots";
	const APP_ID = "nube-devtools-slots";

	try {
		if (sessionStorage.getItem(FLAG_KEY) !== "true") return;
	} catch {
		return;
	}

	/** How long to wait for the runtime before giving up. */
	const READY_TIMEOUT = 30000;
	const READY_POLL = 100;

	/**
	 * Slots the register stores as `Record<pick, component>`, one entry per
	 * product card, line item... (`HANDLED_REPEATABLE_SLOTS` in
	 * nube-sdk-internal).
	 */
	const REPEATABLE_SLOTS = new Set([
		"product_grid_item_image_top_right",
		"product_grid_item_image_top_left",
		"product_grid_item_image_bottom_right",
		"product_grid_item_image_bottom_left",
		"product_grid_item_image_top_center",
		"product_grid_item_image_center_left",
		"product_grid_item_image_center_right",
		"product_grid_item_image_bottom_center",
		"product_grid_item_image_center_center",
		"after_product_grid_item_name",
		"before_product_grid_item_name",
		"before_line_item",
		"after_shipping_description",
		"after_product_grid_item_price",
		"before_product_grid_item_price",
		"before_account_order_item",
		"after_account_order_item",
	]);

	/**
	 * Slots the runtime mounts itself (modal, drawers, floating corners, edges
	 * and bars). A label there would open an overlay, not mark a place.
	 */
	const isRuntimeSlot = (slotId) =>
		/^(modal_|fullscreen_|drawer_|corner_|edge_|bar_)/.test(slotId) ||
		slotId.endsWith("internal");

	const CHECKOUT_SLOTS = [
		"before_main_content",
		"after_header",
		"before_contact_form",
		"after_contact_form",
		"before_address_form",
		"after_address_form",
		"before_shipping_form",
		"after_shipping_form",
		"after_shipping_description",
		"before_billing_form",
		"after_billing_form",
		"before_payment_options",
		"after_payment_options",
		"after_checkout_form",
		"before_line_items",
		"after_line_items",
		"after_line_items_price",
		"after_cart_summary",
		"before_order_number",
		"after_order_number",
		"before_order_summary",
		"after_order_summary",
		"after_main_content",
	];

	const PATAGONIA_SLOTS = [
		"before_main_content",
		"after_header",
		"before_footer",
		"inside_footer",
		"footer_seals",
		"after_footer",
		"before_section_products_featured",
		"after_section_products_featured",
		"before_section_products_new",
		"after_section_products_new",
		"before_section_products_sale",
		"after_section_products_sale",
		"before_section_newsletter",
		"after_section_newsletter",
		"before_product_detail_name",
		"after_product_detail_name",
		"before_product_detail_price",
		"after_product_detail_price",
		"before_product_detail_add_to_cart",
		"after_product_detail_add_to_cart",
		"before_product_detail_payment_options",
		"after_product_detail_payment_options",
		"before_product_detail_shipping_options",
		"after_product_detail_shipping_options",
		"after_product_description",
		"before_product_detail_related_products",
		"after_product_detail_related_products",
		"before_product_detail_complementary_products",
		"after_product_detail_complementary_products",
		"product_detail_image_top_left",
		"product_detail_image_top_center",
		"product_detail_image_top_right",
		"product_detail_image_center_left",
		"product_detail_image_center_center",
		"product_detail_image_center_right",
		"product_detail_image_bottom_left",
		"product_detail_image_bottom_center",
		"product_detail_image_bottom_right",
		"before_quick_buy_add_to_cart",
		"before_product_grid_item_name",
		"after_product_grid_item_name",
		"before_product_grid_item_price",
		"after_product_grid_item_price",
		"product_grid_item_image_top_left",
		"product_grid_item_image_top_center",
		"product_grid_item_image_top_right",
		"product_grid_item_image_center_left",
		"product_grid_item_image_center_center",
		"product_grid_item_image_center_right",
		"product_grid_item_image_bottom_left",
		"product_grid_item_image_bottom_center",
		"product_grid_item_image_bottom_right",
		"before_line_items",
		"before_line_item",
		"after_line_items",
		"before_cart_shipping_options",
		"after_cart_shipping_options",
		"after_cart_summary",
		"before_go_to_checkout",
		"after_go_to_checkout",
		"before_register_form",
		"before_register_form_fields",
		"after_register_form_fields",
		"before_register_form_submit",
		"after_register_form_submit",
		"after_register_form",
	];

	/** The picks of a repeatable slot, read from the state (fallback only). */
	function fallbackPicks(slotId, state) {
		if (slotId === "before_line_item") {
			return (state.cart?.items ?? []).map((item) => String(item.id));
		}
		if (slotId === "after_shipping_description") {
			return (state.shipping?.options ?? [])
				.filter((option) => option.code != null)
				.map((option) => String(option.code));
		}
		// Product grid slots: every product the page lists.
		const data = state.location?.page?.data;
		const ids = new Set();
		for (const list of [
			data?.products,
			...(data?.sections ?? []).map((section) => section.products),
		]) {
			for (const product of list ?? []) ids.add(String(product.id));
		}
		return [...ids];
	}

	/** `[{ slotId, pick }]`, from the host when it can answer. */
	async function readSlots(sdk) {
		const state = sdk.getState();
		const isCheckout = state.location?.page?.type === "checkout";
		const command =
			!isCheckout && state.store?.theme !== "patagonia"
				? sdk.command.get("AvailableSlots", "getAll")
				: undefined;

		if (command) {
			const all = await command.handler({ app_id: APP_ID });
			return [...(all?.static ?? []), ...(all?.dynamic ?? [])];
		}

		const slots = [];
		for (const slotId of isCheckout ? CHECKOUT_SLOTS : PATAGONIA_SLOTS) {
			if (!REPEATABLE_SLOTS.has(slotId)) {
				slots.push({ slotId, pick: null });
				continue;
			}
			for (const pick of fallbackPicks(slotId, state)) {
				slots.push({ slotId, pick });
			}
		}
		return slots;
	}

	/** `product_grid_item_image_top_left` → `pgi_tl`: those slots are tiny. */
	const shortName = (slotId) =>
		slotId
			.replace(
				/^product_(grid_item|detail)_image_([a-z])[a-z]*_([a-z])[a-z]*$/,
				(_, owner, row, column) =>
					`${owner === "detail" ? "pdi" : "pgi"}_${row}${column}`,
			)
			.replace("product_grid_item", "pgi");

	/** `name` may be a plain string or localized (`{ es: "...", pt: "..." }`). */
	const nameOf = (item) =>
		typeof item?.name === "string"
			? item.name
			: item?.name && typeof item.name === "object"
				? Object.values(item.name).find((value) => typeof value === "string")
				: undefined;

	/** What a repeatable slot's pick refers to, e.g. `Product 123 · Shirt`. */
	function describePick(slotId, pick, state) {
		let kind = "Product";
		let item;
		if (slotId === "before_line_item") {
			kind = "Line item";
			item = state.cart?.items?.find((entry) => String(entry.id) === pick);
		} else if (slotId === "after_shipping_description") {
			kind = "Shipping option";
			item = state.shipping?.options?.find(
				(option) => String(option.code) === pick,
			);
		} else if (slotId.endsWith("_account_order_item")) {
			kind = "Order";
		} else {
			const data = state.location?.page?.data;
			for (const list of [
				data?.products,
				...(data?.sections ?? []).map((section) => section.products),
			]) {
				item = item ?? list?.find((product) => String(product.id) === pick);
			}
		}
		const name = nameOf(item);
		return `${kind} ${pick}${name ? ` · ${name}` : ""}`;
	}

	/** Hover details per label DOM id: `[full slot name, pick details?]`. */
	const details = new Map();

	const label = (id, slotId) => ({
		type: "txt",
		__internalId: id,
		style: {
			padding: "4px 6px",
			border: "1px dashed #2196f3",
			borderRadius: "4px",
			background: "#e3f2fdcc",
			color: "#1565c0",
			fontFamily: "monospace",
			fontSize: "11px",
			lineHeight: "1.3",
			wordBreak: "break-all",
		},
		children: shortName(slotId),
	});

	/** This app's slots, in the shape the register stores an app's UI in. */
	function buildSlots(slots, state) {
		const result = {};
		details.clear();
		for (const { slotId, pick } of slots) {
			if (isRuntimeSlot(slotId)) continue;
			const id = `txt-${APP_ID}-${slotId}`;
			if (REPEATABLE_SLOTS.has(slotId)) {
				if (pick == null) continue;
				// One id per pick, so each card can say which one it is.
				const pickId = `${id}-${pick}`;
				details.set(pickId, [
					slotId,
					describePick(slotId, String(pick), state),
				]);
				result[slotId] = result[slotId] ?? {};
				result[slotId][String(pick)] = label(pickId, slotId);
			} else {
				details.set(id, [slotId]);
				result[slotId] = label(id, slotId);
			}
		}
		return result;
	}

	let card;

	function hideCard() {
		if (card) card.style.display = "none";
	}

	/** Shows the hover card for the label under the pointer, if any. */
	function onMouseOver(event) {
		const target = event.target;
		const element =
			typeof target?.closest === "function"
				? target.closest(`[id^="txt-${APP_ID}-"]`)
				: null;
		const lines = element && details.get(element.id);
		if (!lines) {
			hideCard();
			return;
		}

		if (!card) {
			card = document.createElement("div");
			Object.assign(card.style, {
				position: "fixed",
				zIndex: "2147483647",
				pointerEvents: "none",
				maxWidth: "360px",
				padding: "4px 8px",
				borderRadius: "2px",
				background: "#4f4f4f",
				color: "white",
				fontFamily: "monospace",
				fontSize: "11px",
				lineHeight: "1.4",
				wordBreak: "break-all",
			});
			document.body.appendChild(card);
		}

		// Product and shipping names come from the store: text only.
		card.replaceChildren();
		const [slotId, pick] = lines;
		const name = document.createElement("strong");
		name.textContent = slotId;
		card.appendChild(name);
		if (pick) {
			const line = document.createElement("div");
			line.textContent = `pick: ${pick}`;
			card.appendChild(line);
		}

		card.style.display = "block";
		const rect = element.getBoundingClientRect();
		const below = rect.bottom + 4 + card.offsetHeight <= window.innerHeight;
		card.style.top = `${below ? rect.bottom + 4 : Math.max(0, rect.top - 4 - card.offsetHeight)}px`;
		card.style.left = `${Math.max(0, Math.min(rect.left, window.innerWidth - card.offsetWidth))}px`;
	}

	const isComponent = (value) =>
		typeof value === "object" && value !== null && typeof value.type === "string";

	const fragment = (children) => ({ type: "fragment", children });

	/**
	 * `state.ui.slots` from every app's UI, as the register's `handleSlotSet`
	 * builds it: a repeatable slot merges the apps' records (a pick two apps
	 * fill becomes a fragment), any other slot is one component or a fragment
	 * of all of them.
	 */
	function mergeSlots(apps) {
		const parts = {};
		for (const app of Object.values(apps)) {
			for (const [slot, value] of Object.entries(app?.ui?.slots ?? {})) {
				if (value == null) continue;
				parts[slot] = parts[slot] ?? [];
				parts[slot].push(value);
			}
		}

		const merged = {};
		for (const [slot, values] of Object.entries(parts)) {
			if (REPEATABLE_SLOTS.has(slot)) {
				const record = {};
				for (const value of values) {
					if (isComponent(value) || Array.isArray(value)) continue;
					for (const [pick, component] of Object.entries(value)) {
						record[pick] = record[pick]
							? fragment([record[pick], component])
							: component;
					}
				}
				merged[slot] = record;
				continue;
			}

			const components = values.flat().filter(isComponent);
			if (components.length === 1) merged[slot] = components[0];
			else if (components.length > 1) merged[slot] = fragment(components);
		}
		return merged;
	}

	async function render(sdk) {
		try {
			const slots = buildSlots(await readSlots(sdk), sdk.getState());
			sdk.send(APP_ID, "ui:slot:set", (state) => {
				const apps = {
					...state.apps,
					[APP_ID]: {
						...state.apps?.[APP_ID],
						ui: { slots },
					},
				};
				return {
					apps: {
						// `registered` keeps the register from trying to start a
						// worker for this entry.
						[APP_ID]: { id: APP_ID, registered: true, ui: { slots } },
					},
					ui: { slots: mergeSlots(apps) },
				};
			});
		} catch (error) {
			console.warn("[nube-devtools] could not show the slots", error);
		}
	}

	// `command` is only set once the register attached to the real runtime;
	// the bootstrap stub has none.
	const startedAt = Date.now();
	const timer = setInterval(() => {
		const sdk = window.nubeSDK;
		if (typeof sdk?.command?.get === "function") {
			clearInterval(timer);
			document.addEventListener("mouseover", onMouseOver);
			window.addEventListener("scroll", hideCard, true);
			sdk.on("page:loaded", () => render(sdk));
			// `page:loaded` may have fired before the runtime was ready.
			render(sdk);
		} else if (Date.now() - startedAt > READY_TIMEOUT) {
			clearInterval(timer);
		}
	}, READY_POLL);
})();
