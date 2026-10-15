/**
 * Injected into the inspected page's MAIN world to read and reset the log
 * history the devtools hook keeps (see `handleEvents`).
 */

/**
 * The hook's buffered logs the panel has not cleared, oldest first. Empty on
 * SDK versions that predate the log channel.
 *
 * Cloned through JSON: `executeScript` only hands back what it can serialize.
 */
export const readLogs = (): NubeSDKDevtoolsLogRecord[] => {
	const hook = window.__NUBE_SDK_DEVTOOLS_HOOK__;
	if (typeof hook?.logs !== "function") return [];

	const clearedSeq = window.__NUBE_DEVTOOLS_LOGS_CLEARED_SEQ__ ?? -1;
	try {
		return JSON.parse(
			JSON.stringify(hook.logs().filter((record) => record.seq > clearedSeq)),
		);
	} catch {
		return [];
	}
};

/**
 * Hides every log up to `seq` from later snapshots. The hook's buffer belongs
 * to the runtime and is left alone.
 */
export const clearLogs = (seq: number): boolean => {
	window.__NUBE_DEVTOOLS_LOGS_CLEARED_SEQ__ = Math.max(
		window.__NUBE_DEVTOOLS_LOGS_CLEARED_SEQ__ ?? -1,
		seq,
	);
	return true;
};
