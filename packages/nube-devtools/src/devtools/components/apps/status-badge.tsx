import { Badge } from "@/components/ui/badge";
import { Circle, Loader2 } from "lucide-react";
import {
	type ScriptStatus,
	getScriptStatusColor,
	getScriptStatusDotColor,
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

type StatusDotProps = {
	status?: ScriptStatus;
	className?: string;
};

export function StatusDot({ status, className = "" }: StatusDotProps) {
	return (
		<span
			title={status ? getScriptStatusLabel(status) : "unknown"}
			className={`relative flex size-2 shrink-0 items-center justify-center ${className}`}
		>
			{status === "online" && (
				<span className="absolute size-2 animate-ping rounded-full bg-emerald-400/40" />
			)}
			<Circle
				className={`size-1.5 fill-current ${getScriptStatusDotColor(status)}`}
			/>
		</span>
	);
}
