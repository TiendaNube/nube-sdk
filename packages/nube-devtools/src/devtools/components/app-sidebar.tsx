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
import {
	Box,
	ChartNoAxesGantt,
	ComponentIcon,
	NetworkIcon,
	TerminalIcon,
} from "lucide-react";

type MenuItem = {
	title: string;
	page: Page;
	icon: React.ElementType;
	count: number;
};

export function AppSidebar() {
	const { currentPage, navigate } = useNavigation();
	const { countUnshown: consoleCount } = useConsoleEventsContext();
	const { count: networkCount } = useNetworkEventsContext();

	const menu: MenuItem[] = [
		{
			title: "Apps",
			page: PAGES.APPS,
			icon: ComponentIcon,
			count: 0,
		},
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
		{
			title: "Events",
			page: PAGES.EVENTS,
			icon: ChartNoAxesGantt,
			count: 0,
		},
		{
			title: "Network",
			page: PAGES.NETWORK,
			icon: NetworkIcon,
			count: networkCount,
		},
		{
			title: "Storage",
			page: PAGES.STORAGES,
			icon: Box,
			count: 0,
		},
	];

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
											className={`cursor-pointer rounded-none justify-start text-[13px] ${currentPage === item.page ? "shadow-[inset_2px_0_0_0_rgb(180,83,9)]" : ""}`}
											variant="ghost"
											onClick={() => {
												navigate(item.page);
											}}
										>
											<item.icon />
											{currentPage === item.page ? (
												<span className="font-bold text-primary">
													{item.title}
												</span>
											) : (
												<>
													<span className="font-light">{item.title}</span>
													{item.count > 0 && (
														<Badge
															className="text-[10px] px-1 py-0.5"
															variant="outline"
														>
															{item.count}
														</Badge>
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
