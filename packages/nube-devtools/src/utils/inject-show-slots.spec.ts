import { readFileSync } from "node:fs";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SHOW_SLOTS_APP_ID, SHOW_SLOTS_KEY } from "./show-slots";

const SCRIPT = readFileSync(
	path.resolve(__dirname, "../../public/inject-show-slots.js"),
	"utf8",
);

type State = Record<string, unknown> & {
	apps?: Record<string, { ui?: { slots?: Record<string, unknown> } }>;
};
type Modifier = (state: State) => {
	apps: Record<string, unknown>;
	ui: { slots: Record<string, unknown> };
};

type FakeElement = {
	tagName: string;
	style: Record<string, string>;
	textContent: string;
	children: FakeElement[];
	offsetHeight: number;
	offsetWidth: number;
	appendChild: (child: FakeElement) => void;
	replaceChildren: () => void;
};

type MouseOver = (event: { target: unknown }) => void;

const globals = globalThis as unknown as {
	window?: {
		nubeSDK?: unknown;
		innerHeight: number;
		innerWidth: number;
		addEventListener: () => void;
	};
	sessionStorage?: { getItem: (key: string) => string | null };
	document?: unknown;
};

/** Just enough DOM for the hover card. */
function createDocument() {
	const body: FakeElement[] = [];
	let onMouseOver: MouseOver | undefined;
	const createElement = (tagName: string): FakeElement => {
		const element: FakeElement = {
			tagName,
			style: {},
			textContent: "",
			children: [],
			offsetHeight: 20,
			offsetWidth: 100,
			appendChild: (child) => element.children.push(child),
			replaceChildren: () => {
				element.children = [];
			},
		};
		return element;
	};
	const document = {
		createElement,
		body: { appendChild: (child: FakeElement) => body.push(child) },
		addEventListener: (type: string, listener: MouseOver) => {
			if (type === "mouseover") onMouseOver = listener;
		},
	};
	/** Hovers the label rendered with DOM id `id`; returns the card's lines. */
	const hover = (id: string) => {
		const label = {
			id,
			getBoundingClientRect: () => ({ top: 10, bottom: 30, left: 10 }),
		};
		onMouseOver?.({ target: { closest: () => label } });
		const [card] = body;
		return card?.style.display === "block"
			? card.children.map((child) => child.textContent)
			: [];
	};
	return { document, hover };
}

function createSDK(state: State, hostSlots?: unknown) {
	const listeners: Record<string, () => void> = {};
	const sdk = {
		getState: () => state,
		on: (event: string, listener: () => void) => {
			listeners[event] = listener;
		},
		send: vi.fn(),
		command: {
			get: (scope: string, command: string) =>
				hostSlots && scope === "AvailableSlots" && command === "getAll"
					? { handler: async () => hostSlots }
					: undefined,
		},
	};
	return { sdk, listeners };
}

/** Loads the script with the flag set to `flag`, then starts `sdk`. */
async function start(sdk: unknown, flag: string | null = "true") {
	globals.sessionStorage = {
		getItem: (key) => (key === SHOW_SLOTS_KEY ? flag : null),
	};
	globals.document = globals.document ?? createDocument().document;
	globals.window = {
		innerHeight: 800,
		innerWidth: 1200,
		addEventListener: () => {},
	};
	new Function(SCRIPT)();
	globals.window.nubeSDK = sdk;
	await vi.advanceTimersByTimeAsync(100);
}

/** What the last render would write, given the state the runtime holds. */
function lastRender(sdk: ReturnType<typeof createSDK>["sdk"], state: State) {
	const [appId, event, modifier] = sdk.send.mock.calls.at(-1) as [
		string,
		string,
		Modifier,
	];
	expect(appId).toBe(SHOW_SLOTS_APP_ID);
	expect(event).toBe("ui:slot:set");
	return modifier(state);
}

const labelOf = (slotId: string, children = slotId) =>
	expect.objectContaining({ type: "txt", children });

describe("inject-show-slots", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
		globals.window = undefined;
		globals.sessionStorage = undefined;
		globals.document = undefined;
	});

	it("does nothing while the toggle is off", async () => {
		const { sdk } = createSDK({});
		await start(sdk, null);
		await vi.advanceTimersByTimeAsync(1000);
		expect(sdk.send).not.toHaveBeenCalled();
	});

	it("renders the host's slots, skipping the runtime ones", async () => {
		const state: State = { location: { page: { type: "home" } }, store: {} };
		const { sdk } = createSDK(state, {
			static: [
				{ slotId: "before_main_content", pick: null },
				{ slotId: "modal_content", pick: null },
				{ slotId: "product_grid_item_image_top_left", pick: "10" },
				{ slotId: "product_grid_item_image_top_left", pick: "11" },
			],
			dynamic: [{ slotId: "after_header" }],
		});
		await start(sdk);

		const result = lastRender(sdk, state);
		const slots = {
			before_main_content: labelOf("before_main_content"),
			product_grid_item_image_top_left: {
				"10": labelOf("", "pgi_tl"),
				"11": labelOf("", "pgi_tl"),
			},
			after_header: labelOf("after_header"),
		};
		expect(result.apps[SHOW_SLOTS_APP_ID]).toEqual({
			id: SHOW_SLOTS_APP_ID,
			registered: true,
			ui: { slots },
		});
		expect(result.ui.slots).toEqual(slots);
	});

	it("falls back to the fixed checkout list, with picks from the state", async () => {
		const state: State = {
			location: { page: { type: "checkout" } },
			store: {},
			shipping: { options: [{ code: "pac" }, { code: null }] },
		};
		const { sdk } = createSDK(state, { static: [], dynamic: [] });
		await start(sdk);

		const { ui } = lastRender(sdk, state);
		expect(ui.slots.before_contact_form).toEqual(
			labelOf("before_contact_form"),
		);
		expect(ui.slots.after_shipping_description).toEqual({
			pac: labelOf("after_shipping_description"),
		});
	});

	it("merges the labels with what the apps render", async () => {
		const appText = { type: "txt", children: "from the app" };
		const appCard = { type: "txt", children: "card" };
		const state: State = {
			location: { page: { type: "checkout" } },
			store: {},
			shipping: { options: [{ code: "pac" }] },
			apps: {
				"123": {
					ui: {
						slots: {
							before_main_content: appText,
							after_shipping_description: { pac: appCard },
						},
					},
				},
			},
		};
		const { sdk, listeners } = createSDK(state);
		await start(sdk);
		// A navigation renders again.
		listeners["page:loaded"]();
		await vi.advanceTimersByTimeAsync(0);
		expect(sdk.send).toHaveBeenCalledTimes(2);

		const { ui } = lastRender(sdk, state);
		expect(ui.slots.before_main_content).toEqual({
			type: "fragment",
			children: [appText, labelOf("before_main_content")],
		});
		expect(ui.slots.after_shipping_description).toEqual({
			pac: {
				type: "fragment",
				children: [appCard, labelOf("after_shipping_description")],
			},
		});
	});

	it("shows the full slot name and the pick on hover", async () => {
		const { document, hover } = createDocument();
		globals.document = document;
		const state: State = {
			location: {
				page: {
					type: "category",
					data: { products: [{ id: 10, name: { es: "Remera" } }] },
				},
			},
			store: {},
		};
		const { sdk } = createSDK(state, {
			static: [
				{ slotId: "before_main_content", pick: null },
				{ slotId: "product_grid_item_image_top_left", pick: "10" },
			],
			dynamic: [],
		});
		await start(sdk);

		const { ui } = lastRender(sdk, state);
		const card = ui.slots.product_grid_item_image_top_left as Record<
			string,
			{ __internalId: string }
		>;
		expect(hover(card["10"].__internalId)).toEqual([
			"product_grid_item_image_top_left",
			"pick: Product 10 · Remera",
		]);
		expect(hover(`txt-${SHOW_SLOTS_APP_ID}-before_main_content`)).toEqual([
			"before_main_content",
		]);
		expect(hover("something-else")).toEqual([]);
	});
});
