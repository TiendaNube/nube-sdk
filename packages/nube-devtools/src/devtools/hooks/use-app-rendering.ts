import { useNubeSDKEventsContext } from "@/contexts/nube-sdk-events-context";
import {
	type AppRendering,
	summarizeAppRendering,
} from "@/utils/app-rendering";
import { readPageComponents } from "@/utils/page-components";
import { useCallback, useEffect, useRef, useState } from "react";

const REFRESH_DEBOUNCE = 150;
/** A failed read (page mid-navigation) is retried this many times. */
const READ_RETRIES = 3;
const READ_RETRY_DELAY = 500;

/**
 * What each app renders right now, by app id. Re-read after every event, the
 * way the Components page does, since any dispatch may re-render a slot.
 */
export function useAppRendering(): Record<string, AppRendering> {
	const { events } = useNubeSDKEventsContext();
	const [rendering, setRendering] = useState<Record<string, AppRendering>>({});

	// Bumped on each read and on unmount: only the latest read may set state.
	const readSeq = useRef(0);
	const retryTimer = useRef<ReturnType<typeof setTimeout>>();

	const cancelRetry = useCallback(() => {
		clearTimeout(retryTimer.current);
		retryTimer.current = undefined;
	}, []);

	const refresh = useCallback(
		async (retriesLeft = READ_RETRIES) => {
			cancelRetry();
			const seq = ++readSeq.current;
			const snapshot = await readPageComponents();
			if (seq !== readSeq.current) return;
			if (!snapshot) {
				// No new event may come to trigger another read.
				if (retriesLeft > 0) {
					retryTimer.current = setTimeout(
						() => refresh(retriesLeft - 1),
						READ_RETRY_DELAY,
					);
				}
				return;
			}
			const next: Record<string, AppRendering> = {};
			for (const [appId, slots] of Object.entries(snapshot.apps)) {
				next[appId] = summarizeAppRendering(slots);
			}
			setRendering(next);
		},
		[cancelRetry],
	);

	const lastSeq = events.at(-1)?.record.seq ?? -1;
	// biome-ignore lint/correctness/useExhaustiveDependencies: lastSeq is the refresh trigger, not a value the effect reads
	useEffect(() => {
		const timeout = setTimeout(() => refresh(), REFRESH_DEBOUNCE);
		return () => clearTimeout(timeout);
	}, [refresh, lastSeq]);

	useEffect(
		() => () => {
			readSeq.current++;
			cancelRetry();
		},
		[cancelRetry],
	);

	return rendering;
}
