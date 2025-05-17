import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { NubeSDKEvent } from "@/contexts/nube-sdk-apps-context";
import Layout from "@/devtools/components/layout";
import { useState } from "react";
import { AppDetailsPanel } from "../components/app-details-panel";
import { AppsList } from "../components/apps-list";
import { useFetchApps } from "../../hooks/use-fetch-apps";

const STORAGE_KEY = "nube-devtools-apps-panel-size";

export function Apps() {
	const { apps, isLoading, refetch } = useFetchApps();
	const [selectedApp, setSelectedApp] = useState<NubeSDKEvent | null>(null);

	const handleOnSelect = (event: NubeSDKEvent) => {
		setSelectedApp(event);
	};

	return (
		<Layout>
			<div className="flex h-full flex-col">
				<nav className="flex items-center justify-between px-1.5 py-1 border-b h-[33px] shrink-0">
					<div className="flex items-center">
						<SidebarTrigger />
					</div>
					<span className="text-xs">
						{apps.length} {apps.length === 1 ? "app" : "apps"}
					</span>
				</nav>
				<div className="flex-1 overflow-hidden">
					<ResizablePanelGroup
						autoSaveId={STORAGE_KEY}
						storage={localStorage}
						direction="horizontal"
					>
						<ResizablePanel defaultSize={40}>
							<AppsList
								apps={apps}
								selectedApp={selectedApp}
								onSelect={handleOnSelect}
								onReload={refetch}
								isLoading={isLoading}
							/>
						</ResizablePanel>
						<ResizableHandle />
						<ResizablePanel>
							{selectedApp && <AppDetailsPanel app={selectedApp} />}
						</ResizablePanel>
					</ResizablePanelGroup>
				</div>
			</div>
		</Layout>
	);
}
