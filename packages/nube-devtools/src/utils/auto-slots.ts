/**
 * Auto-slot overrides edited in the Auto-Slots tab. They mirror the auto-slots
 * engine's override format (nube-sdk-internal, vanilla-adapter
 * `auto-slot-types.ts`): each key is a slot name, each field replaces that
 * slot's definition, and a name the engine doesn't define adds a slot.
 *
 * They are kept per store in the page's `localStorage`, and
 * `public/inject-auto-slot-overrides.js` hands them to the engine on load.
 */

/** Set by the auto-slots adapter when it loads. */
export const AUTO_SLOTS_FLAG_GLOBAL = "__NUBE_SDK_AUTO_SLOTS__";
/** Read by the auto-slots engine at DOMContentLoaded. */
export const AUTO_SLOT_OVERRIDES_GLOBAL = "__NUBE_SDK_AUTO_SLOT_OVERRIDES__";
/** Page `localStorage` key; keep in sync with the injected script. */
export const AUTO_SLOTS_STORAGE_KEY = "nube-devtools-auto-slots";

export const AUTO_SLOT_POSITIONS = [
	"beforebegin",
	"afterbegin",
	"beforeend",
	"afterend",
	"disabled",
] as const;
export const AUTO_SLOT_PICKS = ["none", "item", "cart"] as const;

export type AutoSlotPosition = (typeof AUTO_SLOT_POSITIONS)[number];
export type AutoSlotPick = (typeof AUTO_SLOT_PICKS)[number];

export type AutoSlotOverride = {
	anchor?: string;
	position?: AutoSlotPosition;
	/** Only used by slots the override adds. */
	pick?: AutoSlotPick;
	style?: string;
};

export type AutoSlotOverrides = Record<string, AutoSlotOverride>;

/** What the tab stores for a store. */
export type StoredAutoSlots = {
	enabled: boolean;
	overrides: AutoSlotOverrides;
};

/** One row of the tab: every field as text, "" meaning "not overridden". */
export type AutoSlotEntry = {
	slot: string;
	anchor: string;
	position: AutoSlotPosition | "";
	pick: AutoSlotPick | "";
	style: string;
};

export const EMPTY_ENTRY: AutoSlotEntry = {
	slot: "",
	anchor: "",
	position: "",
	pick: "",
	style: "",
};

const isPosition = (value: unknown): value is AutoSlotPosition =>
	AUTO_SLOT_POSITIONS.includes(value as AutoSlotPosition);
const isPick = (value: unknown): value is AutoSlotPick =>
	AUTO_SLOT_PICKS.includes(value as AutoSlotPick);

/** Reads the stored value, dropping anything the engine would ignore. */
export function parseStoredAutoSlots(raw: string | null): StoredAutoSlots {
	let value: unknown = null;
	try {
		value = raw ? JSON.parse(raw) : null;
	} catch {
		value = null;
	}
	const stored =
		value && typeof value === "object"
			? (value as Partial<StoredAutoSlots>)
			: {};
	return {
		enabled: stored.enabled === true,
		overrides: entriesToOverrides(overridesToEntries(stored.overrides)),
	};
}

export function overridesToEntries(overrides: unknown): AutoSlotEntry[] {
	if (!overrides || typeof overrides !== "object") {
		return [];
	}
	return Object.entries(overrides as Record<string, unknown>).map(
		([slot, value]) => {
			const override =
				value && typeof value === "object" ? (value as AutoSlotOverride) : {};
			return {
				slot,
				anchor: typeof override.anchor === "string" ? override.anchor : "",
				position: isPosition(override.position) ? override.position : "",
				pick: isPick(override.pick) ? override.pick : "",
				style: typeof override.style === "string" ? override.style : "",
			};
		},
	);
}

/** Rows without a name are left out; empty fields are not overridden. */
export function entriesToOverrides(
	entries: AutoSlotEntry[],
): AutoSlotOverrides {
	const overrides: AutoSlotOverrides = {};
	for (const entry of entries) {
		const slot = entry.slot.trim();
		if (!slot) {
			continue;
		}
		const override: AutoSlotOverride = {};
		const anchor = entry.anchor.trim();
		if (anchor) override.anchor = anchor;
		if (entry.position) override.position = entry.position;
		if (entry.pick) override.pick = entry.pick;
		const style = entry.style.trim();
		if (style) override.style = style;
		overrides[slot] = override;
	}
	return overrides;
}

/** Problems that keep the rows from being saved, by row index. */
export function validateEntries(entries: AutoSlotEntry[]): Map<number, string> {
	const errors = new Map<number, string>();
	const seen = new Set<string>();
	entries.forEach((entry, index) => {
		const slot = entry.slot.trim();
		if (!slot) {
			errors.set(index, "Enter a slot name.");
		} else if (seen.has(slot)) {
			errors.set(index, `"${slot}" is already in the list.`);
		}
		seen.add(slot);
	});
	return errors;
}

/**
 * A script that sets the overrides, for a layout to include before the
 * adapter. `<` is escaped so the script also works inline in a `<script>` tag.
 */
export function buildOverridesScript(
	overrides: AutoSlotOverrides,
	{ host, date }: { host: string; date: Date },
): string {
	const json = JSON.stringify(overrides, null, "\t").replace(/</g, "\\u003c");
	return [
		`// NubeSDK auto-slot overrides for ${host}, exported from NubeSDK DevTools on ${date.toISOString().slice(0, 10)}.`,
		"// Load it before the NubeSDK adapter, e.g. in an inline <script> in the layout's <head>.",
		`window.${AUTO_SLOT_OVERRIDES_GLOBAL} = ${json};`,
		"",
	].join("\n");
}

/**
 * Reads overrides from a script made by `buildOverridesScript`, or from plain
 * JSON. The text is only ever parsed as JSON, never run: a file could hold any
 * code, and the DevTools panel can reach the inspected page. Null when it
 * holds neither form, or no slot.
 */
export function parseOverridesScript(text: string): AutoSlotOverrides | null {
	const assignment = text.match(
		new RegExp(`${AUTO_SLOT_OVERRIDES_GLOBAL}\\s*=`),
	);
	const json =
		assignment?.index === undefined
			? text
			: text.slice(assignment.index + assignment[0].length);

	let value: unknown;
	try {
		value = JSON.parse(json.trim().replace(/;$/, ""));
	} catch {
		return null;
	}
	if (Array.isArray(value)) {
		return null;
	}
	const overrides = entriesToOverrides(overridesToEntries(value));
	return Object.keys(overrides).length > 0 ? overrides : null;
}

export function overridesScriptFilename(host: string): string {
	const safeHost = host.replace(/[^a-z0-9.-]/gi, "_") || "store";
	return `nubesdk-auto-slot-overrides-${safeHost}.js`;
}
