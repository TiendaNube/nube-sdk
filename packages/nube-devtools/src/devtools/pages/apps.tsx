import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import type { NubeSDKEvent } from "@/contexts/nube-sdk-apps-context";
import {
	AppDetailEmpty,
	AppDetailPanel,
	AppList,
	AppsHeader,
} from "@/devtools/components/apps";
import { EmptyState } from "@/devtools/components/empty-state";
import Layout from "@/devtools/components/layout";
import {
	useApps,
	useBlockedApps,
	useLocalModeApp,
	useScriptStatuses,
} from "@/devtools/hooks";
import { useMemo, useState } from "react";

const STORAGE_KEY = "nube-devtools-apps-panel-size";

export function Apps() {
	const { apps, refresh } = useApps();
	const { blockedApps, isBlocked, setBlocked } = useBlockedApps();
	const localModeApp = useLocalModeApp();

	const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
	const [filter, setFilter] = useState("");

	// Blocked apps live in the page's sessionStorage, so they must show up even
	// when the inspected page no longer reports them as installed.
	const allApps = useMemo<NubeSDKEvent[]>(() => {
		const missingBlockedApps = blockedApps
			.filter((blocked) => !apps.some((app) => app.data.id === blocked.id))
			.map((blocked) => ({ id: `blocked:${blocked.id}`, data: blocked }));
		return [...apps, ...missingBlockedApps];
	}, [apps, blockedApps]);

	const scriptStatuses = useScriptStatuses(allApps);

	const isAppOnline = (app: NubeSDKEvent) =>
		scriptStatuses[app.data.script] === "online" && !isBlocked(app.data.id);

	const filteredApps = useMemo(() => {
		const query = filter.trim().toLowerCase();
		if (!query) return allApps;
		return allApps.filter(
			(app) =>
				app.data.id.toLowerCase().includes(query) ||
				app.data.script.toLowerCase().includes(query),
		);
	}, [allApps, filter]);

	const onlineCount = allApps.filter(isAppOnline).length;
	const selectedApp = allApps.find((app) => app.id === selectedAppId) ?? null;

	return (
		<Layout>
			<div className="flex h-full flex-col">
				<AppsHeader total={allApps.length} online={onlineCount} />
				<div className="flex-1 overflow-hidden">
					{allApps.length === 0 ? (
						<EmptyState
							text="No apps found"
							buttonText="Reload page"
							onButtonClick={refresh}
						/>
					) : (
						<ResizablePanelGroup
							autoSaveId={STORAGE_KEY}
							storage={localStorage}
							direction="horizontal"
						>
							<ResizablePanel defaultSize={35} minSize={20}>
								<AppList
									apps={filteredApps}
									filter={filter}
									onFilterChange={setFilter}
									selectedAppId={selectedApp?.id}
									localModeAppId={localModeApp?.appId}
									isReplacedScript={localModeApp?.type === "existing"}
									isAppBlocked={isBlocked}
									isAppOnline={isAppOnline}
									onSelect={(app) => setSelectedAppId(app.id)}
								/>
							</ResizablePanel>
							<ResizableHandle />
							<ResizablePanel>
								{selectedApp ? (
									<AppDetailPanel
										app={selectedApp}
										scriptStatus={scriptStatuses[selectedApp.data.script]}
										isLocalMode={localModeApp?.appId === selectedApp.data.id}
										isBlocked={isBlocked(selectedApp.data.id)}
										onBlockedChange={(blocked) =>
											setBlocked(selectedApp.data, blocked)
										}
									/>
								) : (
									<AppDetailEmpty />
								)}
							</ResizablePanel>
						</ResizablePanelGroup>
					)}
				</div>
			</div>
		</Layout>
	);
}
