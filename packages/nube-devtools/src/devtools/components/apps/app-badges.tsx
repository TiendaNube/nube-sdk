import { Badge } from "@/components/ui/badge";
import { Ban, Globe, TerminalSquare } from "lucide-react";

export function LocalModeBadge() {
	return (
		<Badge
			variant="outline"
			className="gap-1 border-sky-400/40 px-1.5 py-0 text-[10px] text-sky-400"
		>
			<TerminalSquare className="h-2.5 w-2.5" />
			Local Mode
		</Badge>
	);
}

export function RemoteAppBadge() {
	return (
		<Badge
			variant="outline"
			className="gap-1 px-1.5 py-0 text-[10px] text-muted-foreground"
		>
			<Globe className="h-2.5 w-2.5" />
			App
		</Badge>
	);
}

export function BlockedBadge() {
	return (
		<Badge
			variant="outline"
			className="gap-1 border-rose-400/40 px-1.5 py-0 text-[10px] text-rose-400"
		>
			<Ban className="h-2.5 w-2.5" />
			blocked
		</Badge>
	);
}

export function ReplacedScriptBadge() {
	return (
		<Badge
			variant="outline"
			className="px-1.5 py-0 text-[10px] text-muted-foreground"
		>
			Replaced Script
		</Badge>
	);
}
