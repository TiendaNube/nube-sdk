import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

export interface NubeSDKEvent {
	id: string;
	shown: boolean;
	data: {
		id: string;
		registered: boolean;
		script: string;
	};
}

type NubeSDKAppsContextType = {
	apps: NubeSDKEvent[];
	isLoading: boolean;
	setIsLoading: (isLoading: boolean) => void;
	setApps: (apps: NubeSDKEvent[]) => void;
	markAsShown: (id: string) => void;
};

const NubeSDKAppsContext = createContext<NubeSDKAppsContextType | undefined>(
	undefined,
);

export const NubeSDKAppsProvider = ({ children }: { children: ReactNode }) => {
	const [apps, setApps] = useState<NubeSDKEvent[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	const markAsShown = (id: string) => {
		setApps((prev) =>
			prev.map((app) => (app.id === id ? { ...app, shown: true } : app)),
		);
	};

	return (
		<NubeSDKAppsContext.Provider
			value={{ apps, setApps, markAsShown, isLoading, setIsLoading }}
		>
			{children}
		</NubeSDKAppsContext.Provider>
	);
};

export const useNubeSDKAppsContext = () => {
	const context = useContext(NubeSDKAppsContext);
	if (context === undefined) {
		throw new Error(
			"useNubeSDKAppsContext must be used within a NubeSDKAppsProvider",
		);
	}
	return context;
};
