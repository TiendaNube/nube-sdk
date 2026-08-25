import { SidebarTrigger } from "@/components/ui/sidebar";
import { StatusDot } from "./status-badge";

type AppsHeaderProps = {
	total: number;
	online: number;
};

export function AppsHeader({ total, online }: AppsHeaderProps) {
	return (
		<nav className="flex h-[33px] shrink-0 items-center justify-between border-b px-1.5 py-1">
			<div className="flex items-center gap-1.5">
				<SidebarTrigger />
				<span className="text-xs font-medium">Apps</span>
			</div>
			<div className="flex items-center gap-2 pr-1 text-xs text-muted-foreground">
				<span className="flex items-center gap-1.5">
					<StatusDot online={online > 0} />
					{online} online
				</span>
				<span className="text-border">|</span>
				<span>
					{total} {total === 1 ? "app" : "apps"}
				</span>
			</div>
		</nav>
	);
}
