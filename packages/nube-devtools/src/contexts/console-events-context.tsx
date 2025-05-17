import type { ConsoleMessage } from "@/devtools/hooks/use-console-events";
import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";

export type ConsoleEvent = {
	id: string;
	data: ConsoleMessage;
};

interface ConsoleEventsContextType {
	events: ConsoleEvent[];
	setEvents: React.Dispatch<React.SetStateAction<ConsoleEvent[]>>;
	clearEvents: () => void;
}

const ConsoleEventsContext = createContext<
	ConsoleEventsContextType | undefined
>(undefined);

export const ConsoleEventsProvider = ({
	children,
}: {
	children: ReactNode;
}) => {
	const [events, setEvents] = useState<ConsoleEvent[]>([]);

	const clearEvents = () => {
		setEvents([]);
	};

	return (
		<ConsoleEventsContext.Provider value={{ events, setEvents, clearEvents }}>
			{children}
		</ConsoleEventsContext.Provider>
	);
};

export const useConsoleEventsContext = () => {
	const context = useContext(ConsoleEventsContext);
	if (context === undefined) {
		throw new Error(
			"useConsoleEventsContext must be used within a ConsoleEventsProvider",
		);
	}
	return context;
};
