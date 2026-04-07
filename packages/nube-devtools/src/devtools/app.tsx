import { Suspense, lazy } from "react";

import { Toaster } from "@/components/ui/sonner";
import { NubeSDKAppsProvider } from "@/contexts/nube-sdk-apps-context";
import { NubeSDKErrorsProvider } from "@/contexts/nube-sdk-errors-context";
import { NubeSDKEventsProvider } from "@/contexts/nube-sdk-events-context";
import { NubeSDKStorageProvider } from "@/contexts/nube-sdk-storage-context";
import {
	NavigationProvider,
	PAGES,
	useNavigation,
} from "../contexts/navigation-context";
import { useNubeStatus } from "../hooks/use-nube-status";

import { LocalModePage } from "./pages/LocalMode";
import { Apps } from "./pages/apps";
import { Components } from "./pages/components";
import { Errors } from "./pages/errors";
import { Events } from "./pages/events";
import { State } from "./pages/state";
import { Storages } from "./pages/storages";
import { Unavailable } from "./pages/unavailable";

const LazySvgConverter = lazy(() =>
	import("./pages/svg-converter").then((m) => ({ default: m.SvgConverter })),
);

const PAGE_COMPONENTS = {
	[PAGES.APPS]: Apps,
	[PAGES.LOCAL_MODE]: LocalModePage,
	[PAGES.COMPONENTS]: Components,
	[PAGES.ERRORS]: Errors,
	[PAGES.EVENTS]: Events,
	[PAGES.STORAGES]: Storages,
	[PAGES.SVG_CONVERT]: LazySvgConverter,
	[PAGES.STATE]: State,
} as const;

const AppContent = () => {
	const nubeStatus = useNubeStatus();
	const { currentPage } = useNavigation();

	if (!nubeStatus) {
		return <Unavailable />;
	}

	const PageComponent = PAGE_COMPONENTS[currentPage] || Apps;
	return (
		<Suspense>
			<PageComponent />
		</Suspense>
	);
};

export const App = () => {
	return (
		<NavigationProvider>
			<NubeSDKErrorsProvider>
				<NubeSDKEventsProvider>
					<NubeSDKStorageProvider>
						<NubeSDKAppsProvider>
							<AppContent />
							<Toaster />
						</NubeSDKAppsProvider>
					</NubeSDKStorageProvider>
				</NubeSDKEventsProvider>
			</NubeSDKErrorsProvider>
		</NavigationProvider>
	);
};

export default App;
