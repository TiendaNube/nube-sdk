import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

export type NubeSDKStorageEvent = {
	method: string;
	type: "localStorage" | "sessionStorage";
	key: string;
	value: string | null;
};

export type NubeSDKEvent = {
	id: string;
	data: NubeSDKStorageEvent;
};

interface NubeSDKStorageContextType {
	events: NubeSDKEvent[];
	setEvents: React.Dispatch<React.SetStateAction<NubeSDKEvent[]>>;
	cleanup: () => void;
}

const MAX_EVENTS = 1_000;

const NubeSDKStorageContext = createContext<
	NubeSDKStorageContextType | undefined
>(undefined);

export const NubeSDKStorageProvider = ({
	children,
}: { children: ReactNode }) => {
	const [events, setEvents] = useState<NubeSDKEvent[]>([]);

	// Collected here, in the provider, rather than in the Storages page: the
	// page unmounts whenever the panel navigates elsewhere, and a listener
	// living there misses every event dispatched in the meantime — including
	// the app storage writes that happen during page boot.
	useEffect(() => {
		const listener = (port: chrome.runtime.Port) => {
			if (port.name !== "nube-devtools-storage-events") return;

			port.onMessage.addListener((message) => {
				if (!message.payload) return;

				setEvents((prevEvents) =>
					[
						...prevEvents,
						{ id: crypto.randomUUID(), data: message.payload },
					].slice(-MAX_EVENTS),
				);
				port.disconnect();
			});
		};

		chrome.runtime.onConnect.addListener(listener);

		return () => {
			chrome.runtime.onConnect.removeListener(listener);
		};
	}, []);

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
