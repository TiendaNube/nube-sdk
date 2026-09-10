import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

/**
 * One dispatch as reported by the runtime devtools hook. See
 * `NubeSDKDevtoolsRecord` in `src/types.d.ts` for the contract.
 */
export type NubeSDKEventData = NubeSDKDevtoolsRecord;

export type NubeSDKEvent = {
	/**
	 * Row identity. Not `record.seq`: the sequence restarts on every page load
	 * and the list survives navigations.
	 */
	id: string;
	record: NubeSDKEventData;
};

interface NubeSDKEventsContextType {
	events: NubeSDKEvent[];
	setEvents: React.Dispatch<React.SetStateAction<NubeSDKEvent[]>>;
	clearEvents: () => void;
}

/**
 * Upper bound on the retained history. Every record carries full `prev` and
 * `next` state snapshots, so an unbounded list would grow the panel's memory
 * (and the cost of each append) without limit on a busy page.
 */
const MAX_EVENTS = 1_000;

const NubeSDKEventsContext = createContext<
	NubeSDKEventsContextType | undefined
>(undefined);

export const NubeSDKEventsProvider = ({
	children,
}: { children: ReactNode }) => {
	const [events, setEvents] = useState<NubeSDKEvent[]>([]);

	// Collected here, in the provider, rather than in the Events page: the
	// page unmounts whenever the panel navigates elsewhere, and a listener
	// living there misses every event dispatched in the meantime.
	useEffect(() => {
		const listener = (port: chrome.runtime.Port) => {
			if (port.name !== "nube-devtools-events") return;

			port.onMessage.addListener((message) => {
				// One message carries a batch: the injected script coalesces the
				// runtime's replay (and any burst) per microtask.
				const records = message.payload as NubeSDKEventData[];
				if (!Array.isArray(records) || records.length === 0) return;

				setEvents((prevEvents) =>
					[
						...prevEvents,
						...records.map((record) => ({
							id: crypto.randomUUID(),
							record,
						})),
					].slice(-MAX_EVENTS),
				);
			});
		};

		chrome.runtime.onConnect.addListener(listener);

		return () => {
			chrome.runtime.onConnect.removeListener(listener);
		};
	}, []);

	const clearEvents = () => {
		setEvents([]);
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
