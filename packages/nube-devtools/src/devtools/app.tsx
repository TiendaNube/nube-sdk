import { Toaster } from "@/components/ui/sonner";
import { NubeSDKAppsProvider } from "@/contexts/nube-sdk-apps-context";
import { NubeSDKCommandsProvider } from "@/contexts/nube-sdk-commands-context";
import { NubeSDKEventsProvider } from "@/contexts/nube-sdk-events-context";
import { NubeSDKLogsProvider } from "@/contexts/nube-sdk-logs-context";
import { NubeSDKPerformanceProvider } from "@/contexts/nube-sdk-performance-context";
import { NubeSDKStorageProvider } from "@/contexts/nube-sdk-storage-context";
import {
	NavigationProvider,
	PAGES,
	useNavigation,
} from "../contexts/navigation-context";
import { useNubeStatus } from "../hooks/use-nube-status";

import { ApiCalls } from "./pages/api-calls";
import { Apps } from "./pages/apps";
import { Components } from "./pages/components";
import { Events } from "./pages/events";
import { LocalModePage } from "./pages/local-mode";
import { Logs } from "./pages/logs";
import { Performance } from "./pages/performance";
import { State } from "./pages/state";
import { Storages } from "./pages/storages";
import { SvgConverter } from "./pages/svg-converter";
import { Unavailable } from "./pages/unavailable";

const PAGE_COMPONENTS = {
	[PAGES.APPS]: Apps,
	[PAGES.LOCAL_MODE]: LocalModePage,
	[PAGES.COMPONENTS]: Components,
	[PAGES.LOGS]: Logs,
	[PAGES.EVENTS]: Events,
	[PAGES.STORAGES]: Storages,
	[PAGES.API_CALLS]: ApiCalls,
	[PAGES.PERFORMANCE]: Performance,
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
			<NubeSDKLogsProvider>
				<NubeSDKEventsProvider>
					<NubeSDKStorageProvider>
						<NubeSDKCommandsProvider>
							<NubeSDKPerformanceProvider>
								<NubeSDKAppsProvider>
									<AppContent />
									<Toaster />
								</NubeSDKAppsProvider>
							</NubeSDKPerformanceProvider>
						</NubeSDKCommandsProvider>
					</NubeSDKStorageProvider>
				</NubeSDKEventsProvider>
			</NubeSDKLogsProvider>
		</NavigationProvider>
	);
};

export default App;
