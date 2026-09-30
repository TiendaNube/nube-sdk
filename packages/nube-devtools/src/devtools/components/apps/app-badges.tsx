import { Badge } from "@/components/ui/badge";
import { Ban, Globe, Repeat2, TerminalSquare } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const BASE = "h-[18px] gap-1 rounded-md px-1.5 py-0 text-[10px] font-normal";

type AppBadgeProps = {
	icon?: LucideIcon;
	label: string;
	className?: string;
};

function AppBadge({ icon: Icon, label, className = "" }: AppBadgeProps) {
	return (
		<Badge variant="outline" className={`${BASE} ${className}`}>
			{Icon && <Icon className="size-2.5" />}
			{label}
		</Badge>
	);
}

export function LocalModeBadge() {
	return (
		<AppBadge
			icon={TerminalSquare}
			label="Local Mode"
			className="border-sky-400/30 bg-sky-400/5 text-sky-400"
		/>
	);
}

export function HostedAppBadge() {
	return (
		<AppBadge
			icon={Globe}
			label="Hosted"
			className="border-border/60 text-muted-foreground"
		/>
	);
}

export function BlockedBadge() {
	return (
		<AppBadge
			icon={Ban}
			label="Blocked"
			className="border-rose-400/30 bg-rose-400/5 text-rose-400"
		/>
	);
}

export function ReplacedScriptBadge() {
	return (
		<AppBadge
			icon={Repeat2}
			label="Replaced Script"
			className="border-border/60 text-muted-foreground"
		/>
	);
}
