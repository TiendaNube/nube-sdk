import { PAGES, useNavigation } from "@/contexts/navigation-context";
import { Apps } from "@/devtools/pages/apps";
import { Components } from "@/devtools/pages/components";
import { Console } from "@/devtools/pages/console";
import { Events } from "@/devtools/pages/events";
import { Storages } from "@/devtools/pages/storages";
import { Unavailable } from "@/devtools/pages/unavailable";
import { Providers } from "@/devtools/providers";
import { useNubeStatus } from "@/hooks/use-nube-status";

const PAGE_COMPONENTS = {
	[PAGES.APPS]: Apps,
	[PAGES.COMPONENTS]: Components,
	[PAGES.EVENTS]: Events,
	[PAGES.STORAGES]: Storages,
	[PAGES.CONSOLE]: Console,
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
		<Providers>
			<AppContent />
		</Providers>
	);
};

export default App;
