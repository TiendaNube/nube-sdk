import {
	MAX_SIGNAL_RECORDS,
	clearPageSignals,
	readPageSignals,
} from "@/utils/page-signals";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import type { ReactNode } from "react";

export type SignalsRecord = NubeSDKDevtoolsSignalsRecord;
export type SignalGraph = NubeSDKDevtoolsSignalGraph;

interface NubeSDKSignalsContextType {
	/** Every `internal:signals:sync` the page applied, oldest first. */
	records: SignalsRecord[];
	/**
	 * Whether the SDK on the page reports signal changes. `null` until the
	 * opening snapshot resolves. An SDK that predates the channel still
	 * renders signals, so the trees are worth showing either way.
	 */
	supported: boolean | null;
	/**
	 * The latest signal graph of each app that described itself, sorted by
	 * app. An app is missing when it has no signals, or uses a signals package
	 * that predates the graph.
	 */
	graphs: SignalGraph[];
	clearRecords: () => void;
}

const NubeSDKSignalsContext = createContext<
	NubeSDKSignalsContextType | undefined
>(undefined);

/**
 * Records are immutable: a repeated `seq` is the same one, seen once through
 * the snapshot and once through the live stream.
 */
function merge(
	previous: SignalsRecord[],
	incoming: SignalsRecord[],
	clearedSeq: number,
): SignalsRecord[] {
	const seen = new Set(previous.map((record) => record.seq));
	const fresh = incoming.filter(
		(record) => record.seq > clearedSeq && !seen.has(record.seq),
	);
	if (fresh.length === 0) return previous;

	return [...previous, ...fresh]
		.sort((a, b) => a.seq - b.seq)
		.slice(-MAX_SIGNAL_RECORDS);
}

export const NubeSDKSignalsProvider = ({
	children,
}: {
	children: ReactNode;
}) => {
	const [records, setRecords] = useState<SignalsRecord[]>([]);
	const [supported, setSupported] = useState<boolean | null>(null);
	const [graphs, setGraphs] = useState<SignalGraph[]>([]);

	// A graph replaces the previous one of its app; an older one never wins.
	const addGraphs = useCallback((incoming: SignalGraph[]) => {
		setGraphs((previous) => {
			const byApp = new Map(previous.map((graph) => [graph.app, graph]));
			for (const graph of incoming) {
				const current = byApp.get(graph.app);
				if (!current || graph.timestamp >= current.timestamp) {
					byApp.set(graph.app, graph);
				}
			}
			return [...byApp.values()].sort((a, b) => a.app.localeCompare(b.app));
		});
	}, []);
	// A batch already in flight when the panel clears must not bring the
	// cleared records back.
	const clearedSeqRef = useRef(-1);

	const addRecords = useCallback((incoming: SignalsRecord[]) => {
		setRecords((previous) => merge(previous, incoming, clearedSeqRef.current));
	}, []);

	// Collected here, in the provider, rather than in the page: the Components
	// page follows signals too, and a page unmounts when the panel navigates.
	useEffect(() => {
		const listener = (port: chrome.runtime.Port) => {
			const isGraphs = port.name === "nube-devtools-signal-graph-events";
			if (port.name !== "nube-devtools-signal-events" && !isGraphs) return;
			// Every open panel hears every tab's content script; the port belongs
			// to the panel inspecting that tab.
			if (port.sender?.tab?.id !== chrome.devtools.inspectedWindow.tabId) {
				return;
			}

			port.onMessage.addListener((message) => {
				if (Array.isArray(message.payload)) {
					if (isGraphs) addGraphs(message.payload as SignalGraph[]);
					else addRecords(message.payload as SignalsRecord[]);
					// Either can only come from an SDK that has the channel.
					setSupported(true);
				}

				// One connection carries one batch.
				port.disconnect();
			});
		};

		chrome.runtime.onConnect.addListener(listener);

		return () => {
			chrome.runtime.onConnect.removeListener(listener);
		};
	}, [addRecords, addGraphs]);

	// The panel reloads on every navigation, after the page has booted: the
	// snapshot is what brings in what happened before.
	useEffect(() => {
		let cancelled = false;

		readPageSignals().then((snapshot) => {
			if (cancelled) return;
			addRecords(snapshot.records);
			addGraphs(snapshot.graphs);
			setSupported((current) => current === true || snapshot.supported);
		});

		return () => {
			cancelled = true;
		};
	}, [addRecords, addGraphs]);

	const clearRecords = useCallback(() => {
		const lastSeq = records.at(-1)?.seq ?? clearedSeqRef.current;
		clearedSeqRef.current = Math.max(clearedSeqRef.current, lastSeq);
		setRecords([]);
		// The page is told too, or reopening the panel would bring them back.
		clearPageSignals(clearedSeqRef.current);
	}, [records]);

	return (
		<NubeSDKSignalsContext.Provider
			value={{ records, supported, graphs, clearRecords }}
		>
			{children}
		</NubeSDKSignalsContext.Provider>
	);
};

export const useNubeSDKSignals = () => {
	const context = useContext(NubeSDKSignalsContext);
	if (context === undefined) {
		throw new Error(
			"useNubeSDKSignals must be used within a NubeSDKSignalsProvider",
		);
	}
	return context;
};
