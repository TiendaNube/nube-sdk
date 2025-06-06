import type { NubeSDKState } from "@tiendanube/nube-sdk-types";
import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

export type NubeSDKEventData = [
	data: NubeSDKState,
	eventType: string,
	action: string,
];

export type NubeSDKEvent = {
	id: string;
	shown: boolean;
	data: NubeSDKEventData;
};

interface NubeSDKEventsContextType {
	events: NubeSDKEvent[];
	setEvents: React.Dispatch<React.SetStateAction<NubeSDKEvent[]>>;
	clearEvents: () => void;
}

const NubeSDKEventsContext = createContext<
	NubeSDKEventsContextType | undefined
>(undefined);

export const NubeSDKEventsProvider = ({
	children,
}: { children: ReactNode }) => {
	const [events, setEvents] = useState<NubeSDKEvent[]>([]);

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
