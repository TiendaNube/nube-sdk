import { TableCell } from "@/components/ui/table";
import type { NubeSDKEvent } from "@/contexts/nube-sdk-apps-context";
import {
	BlockedBadge,
	HostedAppBadge,
	LocalModeBadge,
	ReplacedScriptBadge,
} from "./app-badges";
import type { ScriptStatus } from "./app-status";
import { StatusDot } from "./status-badge";

type AppListItemProps = {
	app: NubeSDKEvent;
	isSelected: boolean;
	isLocalMode: boolean;
	isReplacedScript: boolean;
	isBlocked: boolean;
	scriptStatus?: ScriptStatus;
	onSelect: (app: NubeSDKEvent) => void;
};

export function AppListItem({
	app,
	isSelected,
	isLocalMode,
	isReplacedScript,
	isBlocked,
	scriptStatus,
	onSelect,
}: AppListItemProps) {
	return (
		<TableCell
			onClick={() => onSelect(app)}
			className={`cursor-pointer p-0 transition-colors ${
				isSelected
					? "bg-amber-700/5 shadow-[inset_2px_0_0_0_rgb(180,83,9)]"
					: "hover:bg-muted/40"
			}`}
		>
			<div className="flex min-w-0 flex-col gap-1.5 px-3 py-2">
				<div className="flex min-w-0 items-center gap-2">
					<StatusDot status={isBlocked ? "offline" : scriptStatus} />
					<span
						className={`min-w-0 flex-1 truncate font-mono text-xs ${
							isBlocked ? "text-muted-foreground line-through" : ""
						}`}
					>
						{app.data.id}
					</span>
				</div>
				<div className="flex flex-wrap items-center gap-1">
					{isLocalMode ? <LocalModeBadge /> : <HostedAppBadge />}
					{isReplacedScript && <ReplacedScriptBadge />}
					{isBlocked && <BlockedBadge />}
				</div>
			</div>
		</TableCell>
	);
}
