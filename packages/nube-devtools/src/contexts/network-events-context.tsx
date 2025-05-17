import type { FetchAuditMessage } from "@/devtools/hooks/use-network-events";
import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";

export type NetworkEvent = {
	id: string;
	data: FetchAuditMessage;
};

interface NetworkEventsContextType {
	events: NetworkEvent[];
	setEvents: React.Dispatch<React.SetStateAction<NetworkEvent[]>>;
	count: number;
	clear: () => void;
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

	return (
		<NetworkEventsContext.Provider
			value={{ events, setEvents, count: events.length, clear }}
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
