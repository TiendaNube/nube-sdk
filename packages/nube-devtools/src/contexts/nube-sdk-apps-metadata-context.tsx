import {
	type NubeSDKAppMetadata,
	type NubeSDKAppsMetadataStatus,
	formatAppLabel,
	getAppsMetadata,
	indexAppsMetadata,
} from "@/utils/apps-metadata";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import type { ReactNode } from "react";

type NubeSDKAppsMetadataContextType = {
	/** Metadata of each app the store described, by app id. */
	metadataById: Record<string, NubeSDKAppMetadata>;
	/** Outcome of the last request, or null until the first answer arrives. */
	status: NubeSDKAppsMetadataStatus | null;
	/** When the store was last asked (epoch ms), or null if never. */
	fetchedAt: number | null;
	isLoading: boolean;
	getAppMetadata: (appId: string) => NubeSDKAppMetadata | undefined;
	/** `{name} by {partner}`, or null when the store did not describe the app. */
	getAppLabel: (appId: string) => string | null;
	/** Asks again; the page still answers from its cache within the minute. */
	refresh: () => Promise<void>;
};

const NubeSDKAppsMetadataContext = createContext<
	NubeSDKAppsMetadataContextType | undefined
>(undefined);

/**
 * Loads the store's apps metadata once, when the panel starts.
 *
 * The panel reloads with every document the tab opens (see `src/devtools`),
 * so mounting is "the devtools started" for this tab and document. Whether
 * that turns into a request is decided in the page, at most once a minute.
 */
export const NubeSDKAppsMetadataProvider = ({
	children,
}: { children: ReactNode }) => {
	const [metadataById, setMetadataById] = useState<
		Record<string, NubeSDKAppMetadata>
	>({});
	const [status, setStatus] = useState<NubeSDKAppsMetadataStatus | null>(null);
	const [fetchedAt, setFetchedAt] = useState<number | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const load = useCallback(async (isCancelled: () => boolean) => {
		const result = await getAppsMetadata();
		if (isCancelled()) return;

		if (result) {
			setMetadataById(indexAppsMetadata(result.apps));
			setStatus(result.status);
			setFetchedAt(result.fetchedAt);
		}
		setIsLoading(false);
	}, []);

	useEffect(() => {
		let cancelled = false;
		load(() => cancelled);
		return () => {
			cancelled = true;
		};
	}, [load]);

	const refresh = useCallback(() => load(() => false), [load]);

	const getAppMetadata = useCallback(
		(appId: string) => metadataById[appId],
		[metadataById],
	);

	const getAppLabel = useCallback(
		(appId: string) => formatAppLabel(metadataById[appId]),
		[metadataById],
	);

	const value = useMemo(
		() => ({
			metadataById,
			status,
			fetchedAt,
			isLoading,
			getAppMetadata,
			getAppLabel,
			refresh,
		}),
		[
			metadataById,
			status,
			fetchedAt,
			isLoading,
			getAppMetadata,
			getAppLabel,
			refresh,
		],
	);

	return (
		<NubeSDKAppsMetadataContext.Provider value={value}>
			{children}
		</NubeSDKAppsMetadataContext.Provider>
	);
};

export const useNubeSDKAppsMetadata = () => {
	const context = useContext(NubeSDKAppsMetadataContext);
	if (context === undefined) {
		throw new Error(
			"useNubeSDKAppsMetadata must be used within a NubeSDKAppsMetadataProvider",
		);
	}
	return context;
};

/**
 * The context, or undefined outside the provider: the popup renders shared
 * components without it, and they fall back to the app id there.
 */
export const useOptionalNubeSDKAppsMetadata = () =>
	useContext(NubeSDKAppsMetadataContext);

/**
 * `(appId) => label`: `{name} by {partner}` when the store described the
 * app, the id otherwise. For places that need a string (titles, options,
 * search); render `<AppLabel>` instead where a node will do.
 */
export const useAppLabel = () => {
	const getAppLabel = useOptionalNubeSDKAppsMetadata()?.getAppLabel;
	return useCallback(
		(appId: string) => getAppLabel?.(appId) ?? appId,
		[getAppLabel],
	);
};
