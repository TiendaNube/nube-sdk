import type { FetchAuditMessage } from "@/devtools/hooks/use-network-script";
import type { ReactNode } from "react";
import { createContext, useContext, useMemo, useState } from "react";

export type NetworkEvent = {
	id: string;
	data: FetchAuditMessage;
	shown: boolean;
};

interface NetworkEventsContextType {
	events: NetworkEvent[];
	setEvents: React.Dispatch<React.SetStateAction<NetworkEvent[]>>;
	countUnshown: number;
	clear: () => void;
	markAsShown: (id: string) => void;
}

const NetworkEventsContext = createContext<
	NetworkEventsContextType | undefined
>(undefined);

export const NetworkEventsProvider = ({
	children,
}: {
	children: ReactNode;
}) => {
	const [events, setEvents] = useState<NetworkEvent[]>([]);

	const clear = () => {
		setEvents([]);
	};

	const markAsShown = (id: string) => {
		setEvents((prev) =>
			prev.map((event) =>
				event.id === id ? { ...event, shown: true } : event,
			),
		);
	};

	const countUnshown = useMemo(() => {
		return events.filter((event) => !event.shown).length;
	}, [events]);

	return (
		<NetworkEventsContext.Provider
			value={{
				events,
				setEvents,
				countUnshown,
				clear,
				markAsShown,
			}}
		>
			{children}
		</NetworkEventsContext.Provider>
	);
};

export const useNetworkEventsContext = () => {
	const context = useContext(NetworkEventsContext);
	if (context === undefined) {
		throw new Error(
			"useNetworkEventsContext must be used within a NetworkEventsProvider",
		);
	}
	return context;
};
