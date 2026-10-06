import { Table, TableBody, TableRow } from "@/components/ui/table";
import type { NubeSDKEvent } from "@/contexts/nube-sdk-apps-context";
import { AppListItem } from "./app-list-item";
import type { ScriptStatus } from "./app-status";

type AppListProps = {
	apps: NubeSDKEvent[];
	selectedAppId?: string;
	localModeAppId?: string;
	isReplacedScript: boolean;
	isAppBlocked: (appId: string) => boolean;
	scriptStatuses: Record<string, ScriptStatus>;
	onSelect: (app: NubeSDKEvent) => void;
};

export function AppList({
	apps,
	selectedAppId,
	localModeAppId,
	isReplacedScript,
	isAppBlocked,
	scriptStatuses,
	onSelect,
}: AppListProps) {
	return (
		<div className="flex h-full flex-col overflow-hidden">
			<div className="flex-1 overflow-y-auto overflow-x-hidden">
				{apps.length === 0 ? (
					<p className="px-1 py-6 text-center text-xs text-muted-foreground">
						No apps match this filter
					</p>
				) : (
					<Table className="table-fixed">
						<TableBody className="[&_tr:last-child]:border-b">
							{apps.map((app) => (
								<TableRow key={app.id} className="border-border/60">
									<AppListItem
										app={app}
										isSelected={app.id === selectedAppId}
										isLocalMode={localModeAppId === app.data.id}
										isReplacedScript={
											localModeAppId === app.data.id && isReplacedScript
										}
										isBlocked={isAppBlocked(app.data.id)}
										scriptStatus={scriptStatuses[app.data.script]}
										onSelect={onSelect}
									/>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</div>
		</div>
	);
}
