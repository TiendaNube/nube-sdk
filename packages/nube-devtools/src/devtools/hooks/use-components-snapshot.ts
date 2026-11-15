import type { NubeSDKComponentsSnapshot } from "@/background/scripts";
import { useNubeSDKEventsContext } from "@/contexts/nube-sdk-events-context";
import { useNubeSDKSignals } from "@/contexts/nube-sdk-signals-context";
import { readPageComponents } from "@/utils/page-components";
import { useCallback, useEffect, useState } from "react";

/**
 * Wait after the last dispatch before re-reading the page. Events like
 * `page:scroll` come in bursts, and so do the changes of a signal bound to a
 * field; the tree only needs the state they settle on.
 */
const REFRESH_DEBOUNCE = 150;

/**
 * The slot trees and signal values of the inspected page, re-read whenever
 * something may have changed them: a dispatch (a slot was re-rendered) or a
 * signal change (a value moved without the slot being sent again).
 */
export function useComponentsSnapshot() {
	const { events } = useNubeSDKEventsContext();
	const { records } = useNubeSDKSignals();

	const [snapshot, setSnapshot] = useState<NubeSDKComponentsSnapshot | null>(
		null,
	);
	const [isLoading, setIsLoading] = useState(true);
	const [updatedAt, setUpdatedAt] = useState(0);

	/** Re-reads the page; resolves `false` when it could not be read. */
	const refresh = useCallback(async (): Promise<boolean> => {
		const next = await readPageComponents();
		setSnapshot(next);
		setIsLoading(false);
		setUpdatedAt(Date.now());
		return next !== null;
	}, []);

	const lastEventSeq = events.at(-1)?.record.seq ?? -1;
	const lastSignalsSeq = records.at(-1)?.seq ?? -1;
	// biome-ignore lint/correctness/useExhaustiveDependencies: the seqs are the refresh triggers, not values the effect reads
	useEffect(() => {
		const timeout = setTimeout(refresh, REFRESH_DEBOUNCE);
		return () => clearTimeout(timeout);
	}, [refresh, lastEventSeq, lastSignalsSeq]);

	return { snapshot, isLoading, updatedAt, refresh };
}
