import { Toaster } from "@/components/ui/sonner";
import {
	AutoSlotsProvider,
	useAutoSlotsFlag,
} from "@/contexts/auto-slots-context";
import { NubeSDKAppsProvider } from "@/contexts/nube-sdk-apps-context";
import { NubeSDKCommandsProvider } from "@/contexts/nube-sdk-commands-context";
import { NubeSDKEventsProvider } from "@/contexts/nube-sdk-events-context";
import { NubeSDKLogsProvider } from "@/contexts/nube-sdk-logs-context";
import { NubeSDKPerformanceProvider } from "@/contexts/nube-sdk-performance-context";
import { NubeSDKStorageProvider } from "@/contexts/nube-sdk-storage-context";
import {
	NubeStatusProvider,
	useNubeStatusContext,
} from "@/contexts/nube-status-context";
import {
	NavigationProvider,
	PAGES,
	useNavigation,
} from "../contexts/navigation-context";

import Layout from "./components/layout";
import { ApiCalls } from "./pages/api-calls";
import { Apps } from "./pages/apps";
import { AutoSlotsPage } from "./pages/auto-slots";
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
	[PAGES.AUTO_SLOTS]: AutoSlotsPage,
	[PAGES.SETTINGS]: SettingsPage,
} as const;

const AppContent = () => {
	const { currentPage } = useNavigation();
	const autoSlots = useAutoSlotsFlag();
	const nubeStatus = useNubeStatusContext();

	// Without the SDK only Settings is available, and it is what can make a page
	// load the SDK. The saved tab is kept for the next page that has it.
	if (nubeStatus !== true && currentPage !== PAGES.SETTINGS) {
		return nubeStatus === false ? <SettingsPage /> : <Layout>{null}</Layout>;
	}

	// The tab was left open on a page without the auto-slots adapter.
	if (currentPage === PAGES.AUTO_SLOTS && autoSlots === false) {
		return <Apps />;
	}

	const PageComponent = PAGE_COMPONENTS[currentPage] || Apps;
	return <PageComponent />;
};

export const App = () => {
	return (
		<NavigationProvider>
			<NubeStatusProvider>
				<AutoSlotsProvider>
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
				</AutoSlotsProvider>
			</NubeStatusProvider>
		</NavigationProvider>
	);
};

export default App;
