import type { ConsoleMessage } from "@/devtools/hooks/use-console-script";
import type { ReactNode } from "react";
import { createContext, useContext, useMemo, useState } from "react";

export type ConsoleEvent = {
	id: string;
	shown: boolean;
	data: ConsoleMessage;
};

interface ConsoleEventsContextType {
	count: number;
	countUnshown: number;
	events: ConsoleEvent[];
	setEvents: React.Dispatch<React.SetStateAction<ConsoleEvent[]>>;
	clear: () => void;
	markAsShown: (id: string) => void;
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
		<ConsoleEventsContext.Provider
			value={{
				count: events.length,
				countUnshown,
				events,
				setEvents,
				clear,
				markAsShown,
			}}
		>
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
