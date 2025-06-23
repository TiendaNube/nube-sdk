import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useConsoleEventsContext } from "@/contexts/console-events-context";
import { PAGES, type Page } from "@/contexts/navigation-context";
import { useNavigation } from "@/contexts/navigation-context";
import { useNetworkEventsContext } from "@/contexts/network-events-context";
import { cn } from "@/lib/utils";
import {
	Box,
	ChartNoAxesGantt,
	ComponentIcon,
	NetworkIcon,
	TerminalIcon,
} from "lucide-react";
import type { LucideProps } from "lucide-react";
import type { ElementType } from "react";
import { useEffect, useMemo, useState } from "react";

type MenuItem = {
	title: string;
	page: Page;
	icon: ElementType<LucideProps>;
	count: number;
};

interface HighlightBadgeProps {
	count: number;
	className?: string;
}

function HighlightBadge({ count, className }: HighlightBadgeProps) {
	const [isHighlighted, setIsHighlighted] = useState(false);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		setIsHighlighted(true);
		const timer = setTimeout(() => {
			setIsHighlighted(false);
		}, 500);

		return () => clearTimeout(timer);
	}, [count]);

	return (
		<Badge
			className={cn(
				"text-[10px] px-1 transition-colors duration-300",
				isHighlighted && "bg-primary/20",
				className,
			)}
			variant="outline"
		>
			{count}
		</Badge>
	);
}

export function AppSidebar() {
	const { currentPage, navigate } = useNavigation();
	const { countUnshown: consoleCount } = useConsoleEventsContext();
	const { countUnshown: networkCount } = useNetworkEventsContext();

	const menu = useMemo<MenuItem[]>(
		() => [
			{ title: "Apps", page: PAGES.APPS, icon: ComponentIcon, count: 0 },
			{
				title: "Components",
				page: PAGES.COMPONENTS,
				icon: ComponentIcon,
				count: 0,
			},
			{
				title: "Console",
				page: PAGES.CONSOLE,
				icon: TerminalIcon,
				count: consoleCount,
			},
			{ title: "Events", page: PAGES.EVENTS, icon: ChartNoAxesGantt, count: 0 },
			{
				title: "Network",
				page: PAGES.NETWORK,
				icon: NetworkIcon,
				count: networkCount,
			},
			{ title: "Storage", page: PAGES.STORAGES, icon: Box, count: 0 },
		],
		[consoleCount, networkCount],
	);

	return (
		<Sidebar>
			<SidebarContent>
				<SidebarGroup className="p-0 pt-2">
					<SidebarGroupLabel className="justify-between">
						<div className="flex items-center gap-2">
							<img
								src="/img/logo-32.png"
								alt="NubeSDK Logo"
								className="w-4 h-4"
							/>
							NubeSDK
						</div>
						<Badge className="text-[10px] px-1 py-0.5" variant="destructive">
							beta
						</Badge>
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{menu.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild>
										<Button
											className={cn(
												"cursor-pointer rounded-none justify-start text-[13px]",
												currentPage === item.page &&
													"shadow-[inset_2px_0_0_0_rgb(180,83,9)]",
											)}
											variant="ghost"
											onClick={() => {
												navigate(item.page);
											}}
										>
											<item.icon size={16} />
											{currentPage === item.page ? (
												<span className="font-bold text-primary">
													{item.title}
												</span>
											) : (
												<>
													<span className="font-light">{item.title}</span>
													{item.count > 0 && (
														<HighlightBadge count={item.count} />
													)}
												</>
											)}
										</Button>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
