import { Input } from "@/components/ui/input";
import { Table, TableBody, TableRow } from "@/components/ui/table";
import type { NubeSDKEvent } from "@/contexts/nube-sdk-apps-context";
import { Search } from "lucide-react";
import { AppListItem } from "./app-list-item";
import type { ScriptStatus } from "./app-status";

type AppListProps = {
	apps: NubeSDKEvent[];
	filter: string;
	onFilterChange: (value: string) => void;
	selectedAppId?: string;
	localModeAppId?: string;
	isReplacedScript: boolean;
	isAppBlocked: (appId: string) => boolean;
	scriptStatuses: Record<string, ScriptStatus>;
	onSelect: (app: NubeSDKEvent) => void;
};

export function AppList({
	apps,
	filter,
	onFilterChange,
	selectedAppId,
	localModeAppId,
	isReplacedScript,
	isAppBlocked,
	scriptStatuses,
	onSelect,
}: AppListProps) {
	return (
		<div className="flex h-full flex-col overflow-hidden">
			<div className="shrink-0 border-b p-2">
				<div className="relative">
					<Search className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
					<Input
						name="filter-apps"
						value={filter}
						placeholder="Filter apps..."
						onChange={(e) => onFilterChange(e.target.value)}
						className="h-7 pl-7 text-[12px] md:text-[12px]"
					/>
				</div>
			</div>
			<div className="flex-1 overflow-y-auto overflow-x-hidden">
				{apps.length === 0 ? (
					<p className="px-1 py-4 text-center text-xs text-muted-foreground">
						No apps match this filter
					</p>
				) : (
					<Table className="table-fixed">
						<TableBody className="[&_tr:last-child]:border-b">
							{apps.map((app) => (
								<TableRow key={app.id}>
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
