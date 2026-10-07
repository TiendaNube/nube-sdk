import { connectToTab } from "@/lib/page-bridge";
import {
	MAX_EVENT_RECORDS,
	clearPageEvents,
	readPageEvents,
} from "@/utils/page-events";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import type { ReactNode } from "react";

/**
 * One dispatch as reported by the runtime devtools hook. See
 * `NubeSDKDevtoolsRecord` in `src/types.d.ts` for the contract.
 */
export type NubeSDKEventData = NubeSDKDevtoolsRecord;

export type NubeSDKEvent = {
	/**
	 * Row identity: `record.seq`. The sequence restarts on every page load,
	 * but the panel reloads with each new document (see `src/devtools`).
	 */
	id: string;
	record: NubeSDKEventData;
};

interface NubeSDKEventsContextType {
	events: NubeSDKEvent[];
	setEvents: React.Dispatch<React.SetStateAction<NubeSDKEvent[]>>;
	clearEvents: () => void;
}

/** Wait before retrying a port that could not connect or was dropped. */
const RECONNECT_DELAY = 1_000;

const NubeSDKEventsContext = createContext<
	NubeSDKEventsContextType | undefined
>(undefined);

export const NubeSDKEventsProvider = ({
	children,
}: { children: ReactNode }) => {
	const [events, setEvents] = useState<NubeSDKEvent[]>([]);

	/** Records up to this `seq` were cleared and stay out of the list. */
	const clearedSeqRef = useRef(-1);

	/**
	 * Adds the records the list does not hold yet, in dispatch order. The
	 * snapshot and the stream overlap — a dispatch landing while the snapshot
	 * is read arrives through both — so `seq` is what dedupes them.
	 *
	 * Bounded because every record carries full `prev` and `next` state
	 * snapshots: an unbounded list would grow the panel's memory (and the
	 * cost of each append) without limit on a busy page.
	 */
	const addRecords = useCallback((records: NubeSDKDevtoolsRecord[]) => {
		setEvents((prevEvents) => {
			const seen = new Set(prevEvents.map((event) => event.record.seq));
			const fresh = records.filter(
				(record) => record.seq > clearedSeqRef.current && !seen.has(record.seq),
			);
			if (fresh.length === 0) return prevEvents;

			return [
				...prevEvents,
				...fresh.map((record) => ({ id: String(record.seq), record })),
			]
				.sort((a, b) => a.record.seq - b.record.seq)
				.slice(-MAX_EVENT_RECORDS);
		});
	}, []);

	// Collected here, in the provider, rather than in the Events page: the
	// page unmounts whenever the panel navigates elsewhere, and a listener
	// living there misses every event dispatched in the meantime.
	//
	// The history lives in the page's devtools hook. The panel opens a port to
	// the content script for new dispatches and, once it is listening, reads
	// the hook for everything before. See `src/contentScript/index.ts`.
	useEffect(() => {
		const tabId = chrome.devtools.inspectedWindow.tabId;
		let retry: ReturnType<typeof setTimeout> | null = null;
		let port: chrome.runtime.Port | null = null;
		let disposed = false;

		const connect = () => {
			const current = connectToTab(tabId, "nube-devtools-events");
			port = current;

			current.onMessage.addListener((message) => {
				if (message?.action === "ready") {
					// Also covers whatever was dispatched while disconnected.
					readPageEvents().then((records) => {
						if (!disposed) addRecords(records);
					});
					return;
				}

				// One message carries a batch: the injected script coalesces
				// bursts per microtask.
				const records = message?.payload as NubeSDKDevtoolsRecord[];
				if (Array.isArray(records) && records.length > 0) {
					addRecords(records);
				}
			});

			// No content script to talk to yet (the page is still loading, or
			// predates the extension), or the document went away: try again.
			current.onDisconnect.addListener(() => {
				// Read so Chrome does not log "Could not establish connection".
				void chrome.runtime.lastError;
				if (port === current) port = null;
				if (!disposed) retry = setTimeout(connect, RECONNECT_DELAY);
			});
		};

		connect();

		return () => {
			disposed = true;
			if (retry) clearTimeout(retry);
			port?.disconnect();
		};
	}, [addRecords]);

	const clearEvents = () => {
		const lastSeq = events.at(-1)?.record.seq ?? clearedSeqRef.current;
		clearedSeqRef.current = Math.max(clearedSeqRef.current, lastSeq);
		setEvents([]);
		// The page is told too, or reopening the panel would bring the cleared
		// events back.
		clearPageEvents(clearedSeqRef.current);
	};

	return (
		<NubeSDKEventsContext.Provider value={{ events, setEvents, clearEvents }}>
			{children}
		</NubeSDKEventsContext.Provider>
	);
};

export const useNubeSDKEventsContext = () => {
	const context = useContext(NubeSDKEventsContext);
	if (context === undefined) {
		throw new Error(
			"useNubeSDKEventsContext must be used within a NubeSDKEventsProvider",
		);
	}
	return context;
};
