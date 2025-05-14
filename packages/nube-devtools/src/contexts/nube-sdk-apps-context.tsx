import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

export interface NubeSDKEvent {
	id: string;
	data: {
		id: string;
		registered: boolean;
		script: string;
	};
}

type NubeSDKAppsContextType = {
	apps: NubeSDKEvent[];
	setApps: (apps: NubeSDKEvent[]) => void;
};

const NubeSDKAppsContext = createContext<NubeSDKAppsContextType | undefined>(
	undefined,
);

export const NubeSDKAppsProvider = ({ children }: { children: ReactNode }) => {
	const [apps, setApps] = useState<NubeSDKEvent[]>([]);

	return (
		<NubeSDKAppsContext.Provider value={{ apps, setApps }}>
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
