import { Badge } from "@/components/ui/badge";
import { Circle, Loader2 } from "lucide-react";
import {
	type ScriptStatus,
	getScriptStatusColor,
	getScriptStatusLabel,
} from "./app-status";

export function ScriptStatusBadge({ status }: { status?: ScriptStatus }) {
	if (!status) return null;

	return (
		<Badge
			variant="outline"
			className={`text-[10px] px-1.5 py-0 gap-1 ${getScriptStatusColor(status)}`}
		>
			{status === "checking" ? (
				<Loader2 className="h-1.5 w-1.5 animate-spin" />
			) : (
				<Circle className="h-1.5 w-1.5 fill-current" />
			)}
			{getScriptStatusLabel(status)}
		</Badge>
	);
}

export function StatusDot({ online }: { online: boolean }) {
	return (
		<Circle
			className={`h-1.5 w-1.5 shrink-0 fill-current ${
				online ? "text-emerald-400" : "text-muted-foreground/60"
			}`}
		/>
	);
}
