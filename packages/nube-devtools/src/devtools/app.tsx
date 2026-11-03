import { Toaster } from "@/components/ui/sonner";
import { NubeSDKAppsProvider } from "@/contexts/nube-sdk-apps-context";
import { NubeSDKCommandsProvider } from "@/contexts/nube-sdk-commands-context";
import { NubeSDKEventsProvider } from "@/contexts/nube-sdk-events-context";
import { NubeSDKLogsProvider } from "@/contexts/nube-sdk-logs-context";
import { NubeSDKPerformanceProvider } from "@/contexts/nube-sdk-performance-context";
import { NubeSDKStorageProvider } from "@/contexts/nube-sdk-storage-context";
import { NubeStatusProvider } from "@/contexts/nube-status-context";
import {
	NavigationProvider,
	PAGES,
	useNavigation,
} from "../contexts/navigation-context";

import { ApiCalls } from "./pages/api-calls";
import { Apps } from "./pages/apps";
import { Components } from "./pages/components";
import { Events } from "./pages/events";
import { LocalModePage } from "./pages/local-mode";
import { Logs } from "./pages/logs";
import { Performance } from "./pages/performance";
import { SettingsPage } from "./pages/settings";
import { State } from "./pages/state";
import { Storages } from "./pages/storages";
import { SvgConverter } from "./pages/svg-converter";

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
	[PAGES.SETTINGS]: SettingsPage,
} as const;

const AppContent = () => {
	const { currentPage } = useNavigation();
	const PageComponent = PAGE_COMPONENTS[currentPage] || Apps;
	return <PageComponent />;
};

export const App = () => {
	return (
		<NavigationProvider>
			<NubeStatusProvider>
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
			</NubeStatusProvider>
		</NavigationProvider>
	);
};

export default App;
