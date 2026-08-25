import type { NubeSDKEvent } from "@/contexts/nube-sdk-apps-context";
import {
	BlockedBadge,
	LocalModeBadge,
	RemoteAppBadge,
	ReplacedScriptBadge,
} from "./app-badges";
import { StatusDot } from "./status-badge";

type AppListItemProps = {
	app: NubeSDKEvent;
	isSelected: boolean;
	isLocalMode: boolean;
	isReplacedScript: boolean;
	isBlocked: boolean;
	isOnline: boolean;
	onSelect: (app: NubeSDKEvent) => void;
};

export function AppListItem({
	app,
	isSelected,
	isLocalMode,
	isReplacedScript,
	isBlocked,
	isOnline,
	onSelect,
}: AppListItemProps) {
	return (
		<button
			type="button"
			onClick={() => onSelect(app)}
			className={`w-full rounded-lg border px-2.5 py-2 text-left transition-colors ${
				isSelected
					? "border-sky-400/50 bg-sky-400/5"
					: "border-border/60 hover:bg-muted/40"
			}`}
		>
			<div className="flex items-center gap-2">
				<span className="min-w-0 flex-1 truncate font-mono text-xs">
					{app.data.id}
				</span>
				<StatusDot online={isOnline} />
			</div>
			<div className="mt-1.5 flex flex-wrap items-center gap-1">
				{isLocalMode ? <LocalModeBadge /> : <RemoteAppBadge />}
				{isReplacedScript && <ReplacedScriptBadge />}
				{isBlocked && <BlockedBadge />}
			</div>
		</button>
	);
}
