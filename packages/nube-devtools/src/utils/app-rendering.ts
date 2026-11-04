/**
 * What an app currently renders, read from `state.apps[id].ui.slots` (see
 * `readComponents`).
 */
export type AppRendering = {
	/** Slots with content, sorted. A cleared slot is null and left out. */
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

export function summarizeAppRendering(
	slots: Record<string, unknown>,
): AppRendering {
	const used = Object.keys(slots)
		.filter((slot) => slots[slot] !== null && slots[slot] !== undefined)
		.sort();
	const ids = new Set<string>();
	for (const slot of used) collectSignals(slots[slot], ids);
	return { slots: used, signals: ids.size };
}
