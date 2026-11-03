import { LocalModeContent } from "@/components/local-mode-content";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { PAGES, useNavigation } from "@/contexts/navigation-context";
import Layout from "@/devtools/components/layout";
import { useApps } from "@/devtools/hooks";
import { LOGS_SEARCH_STORAGE_KEY } from "@/devtools/pages/logs";
import {
	ComponentIcon,
	PackageIcon,
	ScrollTextIcon,
	ServerIcon,
} from "lucide-react";
import { useMemo } from "react";

export function LocalModePage() {
	const { apps } = useApps();
	const { navigate } = useNavigation();
	const localModeApps = useMemo(() => apps.map((app) => app.data), [apps]);

	/**
	 * Where a developer goes right after connecting: the app's own logs are
	 * the first thing to check, then what it rendered. The Logs page reads its
	 * filter from storage on mount, so seeding it is what scopes the list.
	 */
	const renderConnectedActions = (appId: string) => (
		<>
			<Button
				variant="outline"
				size="sm"
				className="h-6 px-2 text-[11px]"
				onClick={() => navigate(PAGES.APPS)}
			>
				<PackageIcon className="size-3" />
				Apps
			</Button>
			<Button
				variant="outline"
				size="sm"
				className="h-6 px-2 text-[11px]"
				onClick={() => {
					localStorage.setItem(LOGS_SEARCH_STORAGE_KEY, appId);
					navigate(PAGES.LOGS);
				}}
			>
				<ScrollTextIcon className="size-3" />
				Logs of this app
			</Button>
			<Button
				variant="outline"
				size="sm"
				className="h-6 px-2 text-[11px]"
				onClick={() => navigate(PAGES.COMPONENTS)}
			>
				<ComponentIcon className="size-3" />
				Components
			</Button>
		</>
	);

	return (
		<Layout>
			<div className="flex h-full flex-col">
				<nav className="flex items-center justify-between px-1.5 py-1 border-b h-[33px] shrink-0">
					<div className="flex items-center min-w-0">
						<SidebarTrigger />
						<Divider />
						<ServerIcon className="size-3 shrink-0" />
						<span className="ml-1.5 text-xs font-medium">Local Mode</span>
						<span className="ml-2 text-xs text-muted-foreground truncate hidden sm:inline">
							Run an app from your local dev server on this page
						</span>
					</div>
				</nav>
				<div className="flex-1 overflow-y-auto p-4 flex justify-center">
					<LocalModeContent
						apps={localModeApps}
						renderConnectedActions={renderConnectedActions}
					/>
				</div>
			</div>
		</Layout>
	);
}
