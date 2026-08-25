import { TableCell } from "@/components/ui/table";
import type { NubeSDKEvent } from "@/contexts/nube-sdk-apps-context";
import {
	BlockedBadge,
	LocalModeBadge,
	RemoteAppBadge,
	ReplacedScriptBadge,
} from "./app-badges";
import type { ScriptStatus } from "./app-status";
import { ScriptStatusBadge } from "./status-badge";

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
			className={`p-0 cursor-pointer transition-colors ${
				isSelected ? "shadow-[inset_2px_0_0_0_rgb(180,83,9)]" : ""
			}`}
		>
			<div className="flex items-start w-full min-w-0">
				<div className="flex-1 flex flex-col gap-1 min-w-0 shrink overflow-hidden px-3 py-2">
					<span className="truncate block">{app.data.id}</span>
					<div className="flex flex-wrap items-center gap-1">
						{isLocalMode ? <LocalModeBadge /> : <RemoteAppBadge />}
						{isReplacedScript && <ReplacedScriptBadge />}
						{isBlocked && <BlockedBadge />}
					</div>
				</div>
				<div className="flex items-center gap-1 pr-2 pt-2 shrink-0">
					<ScriptStatusBadge status={scriptStatus} />
				</div>
			</div>
		</TableCell>
	);
}
