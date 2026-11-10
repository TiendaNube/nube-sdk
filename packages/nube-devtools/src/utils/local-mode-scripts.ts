/**
 * Local Mode can serve several scripts as one app, the way hosts send an app
 * with more than one NubeSDK script. What is stored in the page's
 * `sessionStorage` is read by the register (nube-sdk-internal `attach.ts`):
 *
 * - One script: `{ script, appId }`, run as an app whose id is `appId`.
 * - Several scripts: `scripts` lists them too, and each one runs as an entry
 *   with id `<appId>_<scriptId>`, sharing `appId` and with its own `scriptId`.
 *
 * `script` always holds the first URL, so a register that does not know
 * `scripts` still runs the first one.
 */

export type LocalModeType = "new" | "existing";

export type LocalModeScript = {
	/** Script id within the app: `"1"`, `"2"`, … in the order they were added. */
	id: string;
	script: string;
};

export type StoredApplicationServerData = {
	script?: string;
	connected?: boolean;
	appId?: string;
	type?: LocalModeType;
	/** Only present when there is more than one script. */
	scripts?: LocalModeScript[];
};

export function toLocalModeScripts(urls: string[]): LocalModeScript[] {
	return urls.map((script, index) => ({ id: String(index + 1), script }));
}

/**
 * The URLs to run: the first one falls back to `defaultUrl` when empty, as a
 * single script always did; empty extra fields are dropped.
 */
export function resolveScriptUrls(
	urls: string[],
	defaultUrl: string,
): string[] {
	const [first = "", ...rest] = urls.map((url) => url.trim());
	return [first || defaultUrl, ...rest.filter(Boolean)];
}

export function buildApplicationServerData(params: {
	urls: string[];
	appId: string;
	type: LocalModeType;
	connected: boolean;
}): StoredApplicationServerData {
	const { urls, appId, type, connected } = params;
	return {
		script: urls[0],
		connected,
		appId,
		type,
		...(urls.length > 1 && { scripts: toLocalModeScripts(urls) }),
	};
}

function isLocalModeScript(value: unknown): value is LocalModeScript {
	const candidate = value as LocalModeScript | null;
	return (
		typeof candidate?.id === "string" &&
		typeof candidate?.script === "string" &&
		candidate.script.trim() !== ""
	);
}

/** The script URLs of stored data, in order, whichever shape it has. */
export function readScriptUrls(data: StoredApplicationServerData): string[] {
	const scripts = Array.isArray(data.scripts)
		? data.scripts.filter(isLocalModeScript)
		: [];
	if (scripts.length > 1) return scripts.map((entry) => entry.script);

	const script = data.script?.trim();
	return script ? [script] : [];
}

/** The ids the runtime gives the local scripts: `appId` alone, or one per script. */
export function getLocalModeEntryIds(
	appId: string,
	scriptCount: number,
): string[] {
	if (scriptCount <= 1) return [appId];
	return toLocalModeScripts(Array(scriptCount).fill("")).map(
		(entry) => `${appId}_${entry.id}`,
	);
}
