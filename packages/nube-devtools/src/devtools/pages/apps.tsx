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
import { SearchInput } from "@/devtools/components/search-input";
import {
	useApps,
	useBlockedApps,
	useLocalModeApp,
	useScriptStatuses,
} from "@/devtools/hooks";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "nube-devtools-apps-panel-size";
const SEARCH_STORAGE_KEY = "nube-devtools-apps-filter-search";

export function Apps() {
	const { apps, isLoaded, refresh, isRefreshing } = useApps();
	const { blockedApps, isBlocked, setBlocked } = useBlockedApps();
	const localModeApp = useLocalModeApp();

	const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
	const [filter, setFilter] = useState(
		() => localStorage.getItem(SEARCH_STORAGE_KEY) || "",
	);

	useEffect(() => {
		localStorage.setItem(SEARCH_STORAGE_KEY, filter);
	}, [filter]);

	// Blocked apps live in the page's sessionStorage, so they must show up even
	// when the inspected page no longer reports them as installed.
	const allApps = useMemo<NubeSDKEvent[]>(() => {
		const missingBlockedApps = blockedApps
			.filter((blocked) => !apps.some((app) => app.data.id === blocked.id))
			.map((blocked) => ({ id: `blocked:${blocked.id}`, data: blocked }));
		// Sorted so an app keeps its place when the page starts reporting it.
		return [...apps, ...missingBlockedApps].sort((a, b) =>
			a.data.id.localeCompare(b.data.id),
		);
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
	const selectedApp =
		allApps.find((app) => app.data.id === selectedAppId) ?? null;

	return (
		<Layout>
			<div className="flex h-full flex-col">
				<AppsHeader
					total={allApps.length}
					online={onlineCount}
					isRefreshing={isRefreshing}
					onRefresh={refresh}
				/>
				<div className="flex items-center gap-1 px-1.5 py-1 border-b shrink-0">
					<div className="flex items-center flex-1 min-w-0 max-w-xs">
						<SearchInput
							value={filter}
							onChange={setFilter}
							placeholder="Filter by app or script..."
						/>
					</div>
				</div>
				<div className="flex-1 overflow-hidden">
					{!isLoaded ? (
						<div className="flex h-full items-center justify-center gap-2 text-sm">
							<Loader2 className="size-3 animate-spin" />
							Loading apps...
						</div>
					) : allApps.length === 0 ? (
						<EmptyState
							text="No apps found"
							buttonText={isRefreshing ? "Refreshing..." : "Refresh apps"}
							onButtonClick={refresh}
							isLoading={isRefreshing}
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
									selectedAppId={selectedApp?.id}
									localModeAppId={localModeApp?.appId}
									isReplacedScript={localModeApp?.type === "existing"}
									isAppBlocked={isBlocked}
									scriptStatuses={scriptStatuses}
									onSelect={(app) => setSelectedAppId(app.data.id)}
								/>
							</ResizablePanel>
							<ResizableHandle />
							<ResizablePanel>
								{selectedApp ? (
									<AppDetailPanel
										app={selectedApp}
										scriptStatus={scriptStatuses[selectedApp.data.script]}
										isLocalMode={localModeApp?.appId === selectedApp.data.id}
										isReplacedScript={
											localModeApp?.appId === selectedApp.data.id &&
											localModeApp?.type === "existing"
										}
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
