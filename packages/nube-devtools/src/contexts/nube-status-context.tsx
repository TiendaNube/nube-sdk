import { useNubeStatus } from "@/hooks/use-nube-status";
import { type ReactNode, createContext, useContext } from "react";

const NubeStatusContext = createContext<boolean | null>(null);

/**
 * Checks once per panel whether the inspected page has the NubeSDK. The panel
 * reloads on navigation, so a new page gets a new check.
 */
export function NubeStatusProvider({ children }: { children: ReactNode }) {
	const nubeStatus = useNubeStatus();
	return (
		<NubeStatusContext.Provider value={nubeStatus}>
			{children}
		</NubeStatusContext.Provider>
	);
}

/** Whether the inspected page has the NubeSDK: null while it is being checked. */
export function useNubeStatusContext() {
	return useContext(NubeStatusContext);
}
