import {
	MAX_COMMAND_RECORDS,
	type NubeSDKCommandRecord,
	clearPageCommands,
	readPageCommands,
} from "@/utils/page-commands";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import type { ReactNode } from "react";

export type { NubeSDKCommandRecord };

interface NubeSDKCommandsContextType {
	/** Calls through the command bridge, oldest first. */
	records: NubeSDKCommandRecord[];
	/** The opening snapshot has not resolved yet, so "empty" is not yet known. */
	isLoading: boolean;
	clearRecords: () => void;
}

const NubeSDKCommandsContext = createContext<
	NubeSDKCommandsContextType | undefined
>(undefined);

/**
 * Inserts or replaces records by id.
 *
 * A settled record never goes back to pending: the snapshot and the live
 * stream race on panel open, and whichever of the two arrives last may carry
 * an older view of the same call.
 */
function upsert(
	previous: NubeSDKCommandRecord[],
	incoming: NubeSDKCommandRecord[],
): NubeSDKCommandRecord[] {
	if (incoming.length === 0) return previous;

	const next = [...previous];
	const indexById = new Map(next.map((record, index) => [record.id, index]));

	for (const record of incoming) {
		const index = indexById.get(record.id);
		if (index === undefined) {
			indexById.set(record.id, next.length);
			next.push(record);
			continue;
		}
		if (record.status === "pending" && next[index].status !== "pending") {
			continue;
		}
		next[index] = record;
	}

	// Kept in call order no matter which source delivered a record first.
	next.sort((a, b) => a.startedAt - b.startedAt);
	return next.slice(-MAX_COMMAND_RECORDS);
}

export const NubeSDKCommandsProvider = ({
	children,
}: { children: ReactNode }) => {
	const [records, setRecords] = useState<NubeSDKCommandRecord[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	// Collected here, in the provider, rather than in the page: the page
	// unmounts whenever the panel navigates elsewhere, and a listener living
	// there misses every call made in the meantime.
	useEffect(() => {
		const listener = (port: chrome.runtime.Port) => {
			if (port.name !== "nube-devtools-command-events") return;

			port.onMessage.addListener((message) => {
				const batch = message.payload as NubeSDKCommandRecord[];
				if (Array.isArray(batch)) {
					setRecords((previous) => upsert(previous, batch));
				}

				// One connection carries one batch.
				port.disconnect();
			});
		};

		chrome.runtime.onConnect.addListener(listener);

		return () => {
			chrome.runtime.onConnect.removeListener(listener);
		};
	}, []);

	// The panel reloads on every navigation, which is after the page has made
	// most of its calls: the snapshot is what brings those in.
	useEffect(() => {
		let cancelled = false;

		readPageCommands()
			.then((snapshot) => {
				if (!cancelled) setRecords((previous) => upsert(previous, snapshot));
			})
			.finally(() => {
				if (!cancelled) setIsLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, []);

	const clearRecords = useCallback(() => {
		setRecords([]);
		// The page's copy goes too, or reopening the panel would bring the
		// cleared calls back.
		clearPageCommands();
	}, []);

	return (
		<NubeSDKCommandsContext.Provider
			value={{ records, isLoading, clearRecords }}
		>
			{children}
		</NubeSDKCommandsContext.Provider>
	);
};

export const useNubeSDKCommands = () => {
	const context = useContext(NubeSDKCommandsContext);
	if (context === undefined) {
		throw new Error(
			"useNubeSDKCommands must be used within a NubeSDKCommandsProvider",
		);
	}
	return context;
};
