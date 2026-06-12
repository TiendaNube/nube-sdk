import { CopyableValue } from "@/components/copyable-value";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export type ScriptAvailability =
	| "checking"
	| "available"
	| "unavailable"
	| null;

type LocalModeStatusMessagesProps = {
	status: "idle" | "connecting" | "connected";
	scriptAvailability: ScriptAvailability;
	appId: string;
};

export function LocalModeStatusMessages({
	status,
	scriptAvailability,
	appId,
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
				</div>
			)}
		</>
	);
}
