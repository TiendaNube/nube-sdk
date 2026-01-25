import {
	Box,
	Braces,
	ChartNoAxesGantt,
	CodeXml,
	ComponentIcon,
	Database,
} from "lucide-react";

import { Badge as BadgeComponent } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { PAGES, type Page } from "@/contexts/navigation-context";
import { useNavigation } from "@/contexts/navigation-context";

const Badge = ({ text }: { text: string }) => {
	return (
		<BadgeComponent className="text-[10px] px-1 py-0.5" variant="destructive">
			{text}
		</BadgeComponent>
	);
};

const menu: {
	title: string;
	page: Page;
	icon: React.ElementType;
	badge?: string;
}[] = [
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
		icon: Database,
	},
	{
		title: "SVG Converter",
		page: PAGES.SVG_CONVERT,
		icon: CodeXml,
		badge: "beta",
	},
	{
		title: "State",
		page: PAGES.STATE,
		icon: Braces,
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
								src="/logo/logo-32.png"
								alt="NubeSDK Logo"
								className="w-4 h-4"
							/>
							NubeSDK
						</div>
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
												<div className="flex items-center gap-1">
													<span className="font-bold text-primary">
														{item.title}
													</span>
													{item.badge && <Badge text={item.badge} />}
												</div>
											) : (
												<div className="flex items-center gap-1">
													<span className="font-light">{item.title}</span>
													{item.badge && <Badge text={item.badge} />}
												</div>
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
