import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

interface NubeSDKErrorsContextType {
	appsErrors: Record<string, unknown[]>;
	totalErrors: number;
	clearErrors: () => void;
}

const NubeSDKErrorsContext = createContext<
	NubeSDKErrorsContextType | undefined
>(undefined);

export const NubeSDKErrorsProvider = ({
	children,
}: { children: ReactNode }) => {
	const [appsErrors, setAppsErrors] = useState<Record<string, unknown[]>>({});

	useEffect(() => {
		const listener = (port: chrome.runtime.Port) => {
			if (port.name === "nube-devtools-error-events") {
				port.onMessage.addListener((message) => {
					if (message.payload) {
						const appId = message.payload[2] as string;
						if (appId) {
							const errors = message.payload[0]?.apps?.[appId]?.errors;
							if (errors && Array.isArray(errors)) {
								setAppsErrors((prev) => ({
									...prev,
									[appId]: errors,
								}));
							}
						}
					}
				});
			}
		};

		chrome.runtime.onConnect.addListener(listener);

		return () => {
			chrome.runtime.onConnect.removeListener(listener);
		};
	}, []);

	const totalErrors = Object.values(appsErrors).reduce(
		(acc, errors) => acc + errors.length,
		0,
	);

	const clearErrors = () => {
		setAppsErrors({});
	};

	return (
		<NubeSDKErrorsContext.Provider
			value={{ appsErrors, totalErrors, clearErrors }}
		>
			{children}
		</NubeSDKErrorsContext.Provider>
	);
};

export const useNubeSDKErrorsContext = () => {
	const context = useContext(NubeSDKErrorsContext);
	if (context === undefined) {
		throw new Error(
			"useNubeSDKErrorsContext must be used within a NubeSDKErrorsProvider",
		);
	}
	return context;
};
