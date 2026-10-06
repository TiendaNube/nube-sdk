import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { PackageIcon, RefreshCwIcon } from "lucide-react";
import { StatusDot } from "./status-badge";

type AppsHeaderProps = {
	total: number;
	online: number;
	isRefreshing: boolean;
	onRefresh: () => void;
};

export function AppsHeader({
	total,
	online,
	isRefreshing,
	onRefresh,
}: AppsHeaderProps) {
	return (
		<nav className="flex items-center justify-between px-1.5 py-1 border-b h-[33px] shrink-0">
			<div className="flex items-center min-w-0">
				<SidebarTrigger />
				<Divider />
				<Button
					disabled={isRefreshing}
					variant="ghost"
					size="icon"
					className="h-6 w-6"
					title="Refresh the list"
					onClick={onRefresh}
				>
					<RefreshCwIcon
						className={`size-3 ${isRefreshing ? "animate-spin" : ""}`}
					/>
				</Button>
				<Divider />
				<PackageIcon className="size-3 shrink-0" />
				<span className="ml-1.5 text-xs font-medium">Apps</span>
				<span className="ml-2 text-xs text-muted-foreground truncate hidden sm:inline">
					Apps installed on the page, their status and scripts
				</span>
			</div>
			<div className="flex items-center gap-2 shrink-0 pr-1 text-xs text-muted-foreground">
				<span className="flex items-center gap-1.5">
					<StatusDot status={online > 0 ? "online" : "offline"} />
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
