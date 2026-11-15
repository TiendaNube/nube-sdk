/**
 * Injected into the inspected page's MAIN world to read and reset the signal
 * history the devtools hook keeps (see `handleEvents`).
 */

export type NubeSDKSignalsSnapshot = {
	/**
	 * Whether the SDK on the page reports signal changes. An SDK that predates
	 * the channel still renders signals; it just has no history to show.
	 */
	supported: boolean;
	/** Records the panel has not cleared, oldest first. */
	records: NubeSDKDevtoolsSignalsRecord[];
	/**
	 * The latest signal graph of each app that described itself. Empty when
	 * the SDK or the apps' signals package predate the graph.
	 */
	graphs: NubeSDKDevtoolsSignalGraph[];
};

/** Cloned through JSON: `executeScript` only hands back what it can serialize. */
export const readSignals = (): NubeSDKSignalsSnapshot => {
	const hook = window.__NUBE_SDK_DEVTOOLS_HOOK__;
	if (typeof hook?.signals !== "function") {
		return { supported: false, records: [], graphs: [] };
	}

	let graphs: NubeSDKDevtoolsSignalGraph[] = [];
	try {
		graphs = JSON.parse(JSON.stringify(hook.signalGraphs?.() ?? []));
	} catch {}

	const clearedSeq = window.__NUBE_DEVTOOLS_SIGNALS_CLEARED_SEQ__ ?? -1;
	try {
		return {
			supported: true,
			records: JSON.parse(
				JSON.stringify(
					hook.signals().filter((record) => record.seq > clearedSeq),
				),
			),
			graphs,
		};
	} catch {
		return { supported: true, records: [], graphs };
	}
};

/**
 * Hides every signal record up to `seq` from later snapshots. The hook's
 * buffer belongs to the runtime and is left alone.
 */
export const clearSignals = (seq: number): boolean => {
	window.__NUBE_DEVTOOLS_SIGNALS_CLEARED_SEQ__ = Math.max(
		window.__NUBE_DEVTOOLS_SIGNALS_CLEARED_SEQ__ ?? -1,
		seq,
	);
	return true;
};
