import { Toaster } from "@/components/ui/sonner";
import { NubeSDKEventsProvider } from "@/contexts/nube-sdk-events-context";
import { NubeSDKStorageProvider } from "@/contexts/nube-sdk-storage-context";
import {
	NavigationProvider,
	useNavigation,
} from "../contexts/navigation-context";
import { useNubeStatus } from "../hooks/use-nube-status";

import { NubeSDKAppsProvider } from "@/contexts/nube-sdk-apps-context";
import { Apps } from "./pages/apps";
import { Components } from "./pages/components";
import { Events } from "./pages/events";
import { Storages } from "./pages/storages";
import { Unavailable } from "./pages/unavailable";

const AppContent = () => {
	const nubeStatus = useNubeStatus();
	const { currentPage } = useNavigation();

	if (!nubeStatus) {
		return <Unavailable />;
	}

	switch (currentPage) {
		case "apps":
			return <Apps />;
		case "components":
			return <Components />;
		case "events":
			return <Events />;
		case "storages":
			return <Storages />;
		default:
			return <Apps />;
	}
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
