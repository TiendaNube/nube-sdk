import { Box, ChartNoAxesGantt, ComponentIcon } from "lucide-react";

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
import { PAGES, type Page } from "@/contexts/navigation-context";
import { useNavigation } from "@/contexts/navigation-context";

const menu: { title: string; page: Page; icon: React.ElementType }[] = [
	{
		title: "Apps",
		page: PAGES.APPS,
		icon: ComponentIcon,
	},
	{
		title: "Components",
		page: PAGES.COMPONENTS,
		icon: ComponentIcon,
	},
	{
		title: "Events",
		page: PAGES.EVENTS,
		icon: ChartNoAxesGantt,
	},
	{
		title: "Storage",
		page: PAGES.STORAGES,
		icon: Box,
	},
];

export function AppSidebar() {
	const { currentPage, navigate } = useNavigation();

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
							alpha
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
												<span className="font-light">{item.title}</span>
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
