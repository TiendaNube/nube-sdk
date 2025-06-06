import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

export type NubeSDKStorageEvent = {
	method: string;
	type: "localStorage" | "sessionStorage";
	key: string;
	value: string | null;
};

export type NubeSDKEvent = {
	id: string;
	shown: boolean;
	data: NubeSDKStorageEvent;
};

interface NubeSDKStorageContextType {
	events: NubeSDKEvent[];
	setEvents: React.Dispatch<React.SetStateAction<NubeSDKEvent[]>>;
	cleanup: () => void;
}

const NubeSDKStorageContext = createContext<
	NubeSDKStorageContextType | undefined
>(undefined);

export const NubeSDKStorageProvider = ({
	children,
}: { children: ReactNode }) => {
	const [events, setEvents] = useState<NubeSDKEvent[]>([]);

	const cleanup = () => {
		setEvents([]);
	};

	return (
		<NubeSDKStorageContext.Provider value={{ events, setEvents, cleanup }}>
			{children}
		</NubeSDKStorageContext.Provider>
	);
};

export const useNubeSDKStorage = () => {
	const context = useContext(NubeSDKStorageContext);
	if (context === undefined) {
		throw new Error(
			"useNubeSDKStorage must be used within a NubeSDKStorageProvider",
		);
	}
	return context;
};
