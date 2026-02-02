import { Toaster } from "@/components/ui/sonner";
import { NubeSDKEventsProvider } from "@/contexts/nube-sdk-events-context";
import { NubeSDKStorageProvider } from "@/contexts/nube-sdk-storage-context";
import {
	NavigationProvider,
	PAGES,
	useNavigation,
} from "../contexts/navigation-context";
import { useNubeStatus } from "../hooks/use-nube-status";

import { NubeSDKAppsProvider } from "@/contexts/nube-sdk-apps-context";
import { Apps } from "./pages/apps";
import { Components } from "./pages/components";
import { Events } from "./pages/events";
import { State } from "./pages/state";
import { Storages } from "./pages/storages";
import { SvgConverter } from "./pages/svg-converter";
import { Unavailable } from "./pages/unavailable";

const PAGE_COMPONENTS = {
	[PAGES.APPS]: Apps,
	[PAGES.COMPONENTS]: Components,
	[PAGES.EVENTS]: Events,
	[PAGES.STORAGES]: Storages,
	[PAGES.SVG_CONVERT]: SvgConverter,
	[PAGES.STATE]: State,
} as const;

const AppContent = () => {
	const nubeStatus = useNubeStatus();
	const { currentPage } = useNavigation();

	if (!nubeStatus) {
		return <Unavailable />;
	}

	const PageComponent = PAGE_COMPONENTS[currentPage] || Apps;
	return <PageComponent />;
};

export const App = () => {
	return (
		<NavigationProvider>
			<NubeSDKEventsProvider>
				<NubeSDKStorageProvider>
					<NubeSDKAppsProvider>
						<AppContent />
						<Toaster />
					</NubeSDKAppsProvider>
				</NubeSDKStorageProvider>
			</NubeSDKEventsProvider>
		</NavigationProvider>
	);
};

export default App;
