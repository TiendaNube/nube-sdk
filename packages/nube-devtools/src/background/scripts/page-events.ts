/**
 * Injected into the inspected page's MAIN world to read and reset the event
 * history the devtools hook keeps (see `handleEvents`).
 */

/**
 * The hook's buffered records the panel has not cleared, oldest first.
 *
 * Cloned through JSON: `executeScript` only hands back what it can serialize,
 * and the `prev`/`next` snapshots are plain state anyway.
 */
export const readEvents = (): NubeSDKDevtoolsRecord[] => {
	const hook = window.__NUBE_SDK_DEVTOOLS_HOOK__;
	if (!hook) return [];

	const clearedSeq = window.__NUBE_DEVTOOLS_EVENTS_CLEARED_SEQ__ ?? -1;
	try {
		return JSON.parse(
			JSON.stringify(
				hook.records().filter((record) => record.seq > clearedSeq),
			),
		);
	} catch {
		return [];
	}
};

/**
 * Hides every record up to `seq` from later snapshots. The hook's buffer
 * belongs to the runtime and is left alone.
 */
export const clearEvents = (seq: number): boolean => {
	window.__NUBE_DEVTOOLS_EVENTS_CLEARED_SEQ__ = Math.max(
		window.__NUBE_DEVTOOLS_EVENTS_CLEARED_SEQ__ ?? -1,
		seq,
	);
	return true;
};
