import type { NubeSDKEvent } from "@/contexts/nube-sdk-apps-context";
import type { ScriptStatus } from "@/devtools/components/apps/app-status";
import { useEffect, useRef, useState } from "react";

/**
 * Probes each app script once and exposes its reachability by script url.
 */
export function useScriptStatuses(
	apps: NubeSDKEvent[],
): Record<string, ScriptStatus> {
	const [statuses, setStatuses] = useState<Record<string, ScriptStatus>>({});
	const checked = useRef<Set<string>>(new Set());

	useEffect(() => {
		for (const app of apps) {
			const scriptUrl = app.data.script;
			if (!scriptUrl || checked.current.has(scriptUrl)) continue;

			checked.current.add(scriptUrl);
			setStatuses((prev) => ({ ...prev, [scriptUrl]: "checking" }));

			fetch(scriptUrl, { method: "HEAD", mode: "no-cors" })
				.then(() => {
					setStatuses((prev) => ({ ...prev, [scriptUrl]: "online" }));
				})
				.catch(() => {
					setStatuses((prev) => ({ ...prev, [scriptUrl]: "offline" }));
				});
		}
	}, [apps]);

	return statuses;
}
