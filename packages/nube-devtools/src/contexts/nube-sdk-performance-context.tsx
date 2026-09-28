import type { NubeSDKPerformanceKind } from "@/background/scripts";
import {
	type NubeSDKCommandRecord,
	useNubeSDKCommands,
} from "@/contexts/nube-sdk-commands-context";
import {
	MAX_PERFORMANCE_RECORDS,
	type NubeSDKPerformanceRecord,
	clearPagePerformance,
	readPagePerformance,
} from "@/utils/page-performance";
import {
	ASYNC_BUDGET,
	type PerformanceBudget,
	type PerformanceRating,
	SYNC_BUDGET,
	rate,
} from "@/utils/performance-budget";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import type { ReactNode } from "react";

/** `api-call` entries come from the API Calls panel's own records. */
export type PerformanceEntryKind = NubeSDKPerformanceKind | "api-call";

export type PerformanceEntry = Omit<NubeSDKPerformanceRecord, "kind"> & {
	kind: PerformanceEntryKind;
	budget: PerformanceBudget;
	rating: PerformanceRating;
};

interface NubeSDKPerformanceContextType {
	/** Every measurement, oldest first. */
	entries: PerformanceEntry[];
	/** Entries rated `poor`, for the sidebar badge. */
	poorCount: number;
	/** The opening snapshot has not resolved yet, so "empty" is not yet known. */
	isLoading: boolean;
	clearEntries: () => void;
}

const NubeSDKPerformanceContext = createContext<
	NubeSDKPerformanceContextType | undefined
>(undefined);

/**
 * Handler and modifier runs hold the worker's thread, so they are held to the
 * long-task budget. Everything else is something the user waits on.
 */
function budgetFor(
	kind: PerformanceEntryKind,
	source: string,
	metric?: string,
) {
	if (kind !== "script") return ASYNC_BUDGET;
	if (metric === "long-task") return SYNC_BUDGET;
	return source === "app-init" ? ASYNC_BUDGET : SYNC_BUDGET;
}

function toEntry(record: NubeSDKPerformanceRecord): PerformanceEntry {
	const budget = budgetFor(record.kind, record.source, record.metric);
	return { ...record, budget, rating: rate(record.duration, budget) };
}

function commandToEntry(
	record: NubeSDKCommandRecord & { duration: number },
): PerformanceEntry {
	return {
		id: `api-call-${record.id}`,
		appId: record.appId,
		kind: "api-call",
		source: "nube.api",
		name: `${record.scope}.${record.command}`,
		startedAt: record.startedAt,
		duration: record.duration,
		success: record.status === "success",
		error: record.error?.message,
		budget: ASYNC_BUDGET,
		rating: rate(record.duration, ASYNC_BUDGET),
	};
}

/** Records are immutable once reported: a repeated id is the same record. */
function merge(
	previous: NubeSDKPerformanceRecord[],
	incoming: NubeSDKPerformanceRecord[],
): NubeSDKPerformanceRecord[] {
	if (incoming.length === 0) return previous;

	const seen = new Set(previous.map((record) => record.id));
	const next = [...previous];
	for (const record of incoming) {
		if (seen.has(record.id)) continue;
		seen.add(record.id);
		next.push(record);
	}

	next.sort((a, b) => a.startedAt - b.startedAt);
	return next.slice(-MAX_PERFORMANCE_RECORDS);
}

export const NubeSDKPerformanceProvider = ({
	children,
}: { children: ReactNode }) => {
	const { records: commands } = useNubeSDKCommands();
	const [records, setRecords] = useState<NubeSDKPerformanceRecord[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	// API calls belong to the API Calls panel, so clearing this one hides them
	// instead of deleting them there.
	const [clearedAt, setClearedAt] = useState(0);

	// Collected here, in the provider, rather than in the page: the page
	// unmounts whenever the panel navigates elsewhere.
	useEffect(() => {
		const listener = (port: chrome.runtime.Port) => {
			if (port.name !== "nube-devtools-performance-events") return;
			// Every open panel hears every tab's content script; the port belongs
			// to the panel inspecting that tab.
			if (port.sender?.tab?.id !== chrome.devtools.inspectedWindow.tabId) {
				return;
			}

			port.onMessage.addListener((message) => {
				const batch = message.payload as NubeSDKPerformanceRecord[];
				if (Array.isArray(batch)) {
					setRecords((previous) => merge(previous, batch));
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

	// The panel reloads on every navigation, after the page has booted: the
	// snapshot is what brings in the page load.
	useEffect(() => {
		let cancelled = false;

		readPagePerformance()
			.then((snapshot) => {
				if (!cancelled) setRecords((previous) => merge(previous, snapshot));
			})
			.finally(() => {
				if (!cancelled) setIsLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, []);

	const entries = useMemo(() => {
		const apiCalls = commands
			.filter(
				(record): record is NubeSDKCommandRecord & { duration: number } =>
					record.duration !== null && record.startedAt >= clearedAt,
			)
			.map(commandToEntry);

		return [...records.map(toEntry), ...apiCalls].sort(
			(a, b) => a.startedAt - b.startedAt,
		);
	}, [records, commands, clearedAt]);

	const poorCount = useMemo(
		() => entries.filter((entry) => entry.rating === "poor").length,
		[entries],
	);

	const clearEntries = useCallback(() => {
		setRecords([]);
		setClearedAt(Date.now());
		// The page's copy goes too, or reopening the panel would bring the
		// cleared measurements back.
		clearPagePerformance();
	}, []);

	return (
		<NubeSDKPerformanceContext.Provider
			value={{ entries, poorCount, isLoading, clearEntries }}
		>
			{children}
		</NubeSDKPerformanceContext.Provider>
	);
};

export const useNubeSDKPerformance = () => {
	const context = useContext(NubeSDKPerformanceContext);
	if (context === undefined) {
		throw new Error(
			"useNubeSDKPerformance must be used within a NubeSDKPerformanceProvider",
		);
	}
	return context;
};
