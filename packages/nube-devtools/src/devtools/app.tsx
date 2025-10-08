import { PAGES, useNavigation } from "@/contexts/navigation-context";
import { Apps } from "@/devtools/pages/apps";
import { Components } from "@/devtools/pages/components";
import { Events } from "@/devtools/pages/events";
import { Storages } from "@/devtools/pages/storages";
import { SvgConverter } from "@/devtools/pages/svg-converter";
import { Unavailable } from "@/devtools/pages/unavailable";
import { Providers } from "@/devtools/providers";
import { useNubeStatus } from "@/hooks/use-nube-status";

const PAGE_COMPONENTS = {
	[PAGES.APPS]: Apps,
	[PAGES.COMPONENTS]: Components,
	[PAGES.EVENTS]: Events,
	[PAGES.STORAGES]: Storages,
	[PAGES.SVG_CONVERT]: SvgConverter,
} as const;

const MainContent = () => {
	const { currentPage } = useNavigation();

	const PageComponent = PAGE_COMPONENTS[currentPage] || Apps;
	return <PageComponent />;
};

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
