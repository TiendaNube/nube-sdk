import { CopyableValue } from "@/components/copyable-value";
import { Switch } from "@/components/ui/switch";
import {
	AlertCircle,
	CheckCircle2,
	InfoIcon,
	Loader2,
	RefreshCwIcon,
} from "lucide-react";
import type { ReactNode } from "react";

export type ScriptAvailability =
	| "checking"
	| "available"
	| "unavailable"
	| null;

type LocalModeStatusMessagesProps = {
	status: "idle" | "connecting" | "connected";
	scriptAvailability: ScriptAvailability;
	appId: string;
	autoReload: boolean;
	onAutoReloadChange: (enabled: boolean) => void;
	/**
	 * Where to go next once connected. Only the panel has somewhere to go;
	 * the popup leaves it out.
	 */
	actions?: ReactNode;
};

export function LocalModeStatusMessages({
	status,
	scriptAvailability,
	appId,
	autoReload,
	onAutoReloadChange,
	actions,
}: LocalModeStatusMessagesProps) {
	if (status !== "connected") {
		return null;
	}

	return (
		<>
			{scriptAvailability === "checking" && (
				<div className="flex items-start gap-1.5 p-2 rounded-md bg-secondary border border-border">
					<Loader2 className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5 animate-spin" />
					<p className="text-[11px] font-medium text-muted-foreground">
						Checking if script is available...
					</p>
				</div>
			)}
			{scriptAvailability === "available" && (
				<div className="flex items-start gap-1.5 p-2 rounded-md bg-green-500/10 border border-green-500/20">
					<CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
					<p className="text-[11px] font-medium text-green-600 dark:text-green-400">
						Script is available
					</p>
				</div>
			)}
			{scriptAvailability === "unavailable" && (
				<div className="flex items-start gap-1.5 p-2 rounded-md bg-destructive/10 border border-destructive/20">
					<AlertCircle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />
					<p className="text-[11px] font-medium text-destructive">
						Script is not available
					</p>
				</div>
			)}
			{appId && (
				<div className="space-y-1.5 p-2 rounded-md bg-secondary">
					<div>
						<p className="text-[10px] text-muted-foreground mb-0.5">App ID</p>
						<CopyableValue value={appId} fontSize="text-[10px]" />
					</div>
					{actions && (
						<div className="flex flex-wrap items-center gap-1 pt-0.5">
							{actions}
						</div>
					)}
				</div>
			)}

			<label
				htmlFor="local-mode-auto-reload"
				className="flex items-center gap-2 p-2 rounded-md border border-border cursor-pointer"
			>
				<RefreshCwIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
				<span className="flex-1 min-w-0">
					<span className="block text-[11px] font-medium">
						Reload on change
					</span>
					<span className="block text-[10px] text-muted-foreground">
						Reloads the page when the script at the URL changes. Needs the
						NubeSDK panel open.
					</span>
				</span>
				<Switch
					id="local-mode-auto-reload"
					checked={autoReload}
					onCheckedChange={onAutoReloadChange}
				/>
			</label>

			<div className="flex items-start gap-1.5 px-0.5">
				<InfoIcon className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
				<p className="text-[10px] text-muted-foreground">
					Local Mode applies to this tab only. The store opened in another tab
					loads without it.
				</p>
			</div>
		</>
	);
}
