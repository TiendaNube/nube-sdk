import { LocalModeContent } from "@/components/local-mode-content";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Layout from "@/devtools/components/layout";
import { useApps } from "@/devtools/hooks";
import { useMemo } from "react";

export function LocalModePage() {
	const { apps } = useApps();
	const localModeApps = useMemo(() => apps.map((app) => app.data), [apps]);

	return (
		<Layout>
			<div className="flex h-full flex-col">
				<nav className="flex items-center px-1.5 justify-between py-1 border-b h-[33px] shrink-0">
					<SidebarTrigger />
				</nav>
				<div className="flex-1 overflow-y-auto p-4 flex justify-center">
					<LocalModeContent apps={localModeApps} />
				</div>
			</div>
		</Layout>
	);
}
