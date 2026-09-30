import { LocalModeContent } from "@/components/local-mode-content";
import { Divider } from "@/components/ui/divider";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Layout from "@/devtools/components/layout";
import { useApps } from "@/devtools/hooks";
import { ServerIcon } from "lucide-react";
import { useMemo } from "react";

export function LocalModePage() {
	const { apps } = useApps();
	const localModeApps = useMemo(() => apps.map((app) => app.data), [apps]);

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
					<LocalModeContent apps={localModeApps} />
				</div>
			</div>
		</Layout>
	);
}
