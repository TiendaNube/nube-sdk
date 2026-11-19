/**
 * What an app currently renders, read from `state.apps[id].ui.slots` (see
 * `readComponents`).
 */
export type AppRendering = {
	/**
	 * Slots with content, sorted. A cleared slot (null) or one with nothing to
	 * render (`[]`, an empty repeatable record) is left out, as in Components.
	 */
	slots: string[];
	/** Distinct signals rendered across those slots. */
	signals: number;
};

function collectSignals(node: unknown, ids: Set<string>): void {
	if (!node || typeof node !== "object") return;
	if (Array.isArray(node)) {
		for (const child of node) collectSignals(child, ids);
		return;
	}
	const record = node as Record<string, unknown>;
	// A signal is serialized in the tree as `{ type: "signal", __internalId }`.
	if (record.type === "signal" && typeof record.__internalId === "string") {
		ids.add(record.__internalId);
		return;
	}
	for (const value of Object.values(record)) collectSignals(value, ids);
}

/**
 * Whether a slot value renders anything: a component, text, or a list or keyed
 * record holding one. `public/inject-performance-monitor.js` repeats this rule;
 * keep both in sync.
 */
function hasContent(value: unknown): boolean {
	if (value === null || value === undefined) return false;
	if (Array.isArray(value)) return value.some(hasContent);
	if (typeof value !== "object") return true;
	const record = value as Record<string, unknown>;
	if (typeof record.type === "string") return true;
	// A repeatable slot's content: `Record<entryKey, component>`.
	return Object.values(record).some(hasContent);
}

export function summarizeAppRendering(
	slots: Record<string, unknown>,
): AppRendering {
	const used = Object.keys(slots)
		.filter((slot) => hasContent(slots[slot]))
		.sort();
	const ids = new Set<string>();
	for (const slot of used) collectSignals(slots[slot], ids);
	return { slots: used, signals: ids.size };
}
