import { useNubeSDKEventsContext } from "@/contexts/nube-sdk-events-context";
import {
	type AppRendering,
	summarizeAppRendering,
} from "@/utils/app-rendering";
import { readPageComponents } from "@/utils/page-components";
import { useCallback, useEffect, useState } from "react";

const REFRESH_DEBOUNCE = 150;

/**
 * What each app renders right now, by app id. Re-read after every event, the
 * way the Components page does, since any dispatch may re-render a slot.
 */
export function useAppRendering(): Record<string, AppRendering> {
	const { events } = useNubeSDKEventsContext();
	const [rendering, setRendering] = useState<Record<string, AppRendering>>({});

	const refresh = useCallback(async () => {
		const snapshot = await readPageComponents();
		if (!snapshot) return;
		const next: Record<string, AppRendering> = {};
		for (const [appId, slots] of Object.entries(snapshot.apps)) {
			next[appId] = summarizeAppRendering(slots);
		}
		setRendering(next);
	}, []);

	const lastSeq = events.at(-1)?.record.seq ?? -1;
	// biome-ignore lint/correctness/useExhaustiveDependencies: lastSeq is the refresh trigger, not a value the effect reads
	useEffect(() => {
		const timeout = setTimeout(refresh, REFRESH_DEBOUNCE);
		return () => clearTimeout(timeout);
	}, [refresh, lastSeq]);

	return rendering;
}
