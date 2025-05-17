import { PAGES, useNavigation } from "@/contexts/navigation-context";
import { Apps } from "@/devtools/pages/apps";
import { Components } from "@/devtools/pages/components";
import { Console } from "@/devtools/pages/console";
import { Network } from "@/devtools/pages/network";
import { Events } from "@/devtools/pages/events";
import { Storages } from "@/devtools/pages/storages";
import { Unavailable } from "@/devtools/pages/unavailable";
import { Providers } from "@/devtools/providers";
import { useNubeStatus } from "@/hooks/use-nube-status";
import { useConsoleEvents } from "@/devtools/hooks/use-console-events";
import { useNetworkEvents } from "@/devtools/hooks/use-network-events";

const PAGE_COMPONENTS = {
	[PAGES.APPS]: Apps,
	[PAGES.COMPONENTS]: Components,
	[PAGES.EVENTS]: Events,
	[PAGES.STORAGES]: Storages,
	[PAGES.CONSOLE]: Console,
	[PAGES.NETWORK]: Network,
} as const;

const MainContent = () => {
  const { currentPage } = useNavigation();
  useConsoleEvents();
	useNetworkEvents();

  const PageComponent = PAGE_COMPONENTS[currentPage] || Apps;
	return <PageComponent />;
}


const AppContent = () => {
	const nubeStatus = useNubeStatus();

	if (!nubeStatus) {
		return <Unavailable />;
	}

	return <MainContent />;
};

export const App = () => {
	return (
		<Providers>
			<AppContent />
		</Providers>
	);
};

export default App;
