import {
	MAX_LOG_RECORDS,
	clearPageLogs,
	readPageLogs,
} from "@/utils/page-logs";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import type { ReactNode } from "react";

export type LogLevel = NubeSDKDevtoolsLogLevel;
export type LogEntry = NubeSDKDevtoolsLogRecord;

/** Levels that count as errors, for the sidebar badge. */
export const ERROR_LEVELS: ReadonlySet<LogLevel> = new Set(["ERROR", "FATAL"]);

interface NubeSDKLogsContextType {
	/** Every log, oldest first. */
	logs: LogEntry[];
	/** `ERROR` and `FATAL` logs, for the sidebar badge. */
	errorCount: number;
	/** `WARN` logs, for the sidebar badge. */
	warnCount: number;
	/** The opening snapshot has not resolved yet, so "empty" is not yet known. */
	isLoading: boolean;
	clearLogs: () => void;
}

const NubeSDKLogsContext = createContext<NubeSDKLogsContextType | undefined>(
	undefined,
);

/**
 * Logs are immutable once reported: a repeated `seq` is the same log, seen
 * once through the snapshot and once through the live stream.
 */
function merge(
	previous: LogEntry[],
	incoming: LogEntry[],
	clearedSeq: number,
): LogEntry[] {
	const seen = new Set(previous.map((log) => log.seq));
	const fresh = incoming.filter(
		(log) => log.seq > clearedSeq && !seen.has(log.seq),
	);
	if (fresh.length === 0) return previous;

	return [...previous, ...fresh]
		.sort((a, b) => a.seq - b.seq)
		.slice(-MAX_LOG_RECORDS);
}

export const NubeSDKLogsProvider = ({ children }: { children: ReactNode }) => {
	const [logs, setLogs] = useState<LogEntry[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	// A batch already in flight when the panel clears must not bring the
	// cleared logs back.
	const clearedSeqRef = useRef(-1);

	const addLogs = useCallback((incoming: LogEntry[]) => {
		setLogs((previous) => merge(previous, incoming, clearedSeqRef.current));
	}, []);

	// Collected here, in the provider, rather than in the page: the page
	// unmounts whenever the panel navigates elsewhere.
	useEffect(() => {
		const listener = (port: chrome.runtime.Port) => {
			if (port.name !== "nube-devtools-log-events") return;
			// Every open panel hears every tab's content script; the port belongs
			// to the panel inspecting that tab.
			if (port.sender?.tab?.id !== chrome.devtools.inspectedWindow.tabId) {
				return;
			}

			port.onMessage.addListener((message) => {
				const batch = message.payload as LogEntry[];
				if (Array.isArray(batch)) addLogs(batch);

				// One connection carries one batch.
				port.disconnect();
			});
		};

		chrome.runtime.onConnect.addListener(listener);

		return () => {
			chrome.runtime.onConnect.removeListener(listener);
		};
	}, [addLogs]);

	// The panel reloads on every navigation, after the page has booted: the
	// snapshot is what brings in the page load.
	useEffect(() => {
		let cancelled = false;

		readPageLogs()
			.then((snapshot) => {
				if (!cancelled) addLogs(snapshot);
			})
			.finally(() => {
				if (!cancelled) setIsLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, [addLogs]);

	const { errorCount, warnCount } = useMemo(() => {
		let errors = 0;
		let warnings = 0;
		for (const log of logs) {
			if (ERROR_LEVELS.has(log.level)) errors++;
			else if (log.level === "WARN") warnings++;
		}
		return { errorCount: errors, warnCount: warnings };
	}, [logs]);

	const clearLogs = useCallback(() => {
		const lastSeq = logs.at(-1)?.seq ?? clearedSeqRef.current;
		clearedSeqRef.current = Math.max(clearedSeqRef.current, lastSeq);
		setLogs([]);
		// The page is told too, or reopening the panel would bring the cleared
		// logs back.
		clearPageLogs(clearedSeqRef.current);
	}, [logs]);

	return (
		<NubeSDKLogsContext.Provider
			value={{ logs, errorCount, warnCount, isLoading, clearLogs }}
		>
			{children}
		</NubeSDKLogsContext.Provider>
	);
};

export const useNubeSDKLogs = () => {
	const context = useContext(NubeSDKLogsContext);
	if (context === undefined) {
		throw new Error("useNubeSDKLogs must be used within a NubeSDKLogsProvider");
	}
	return context;
};
