import {
	ArrowRightLeft,
	Braces,
	ChartNoAxesGantt,
	CircleX,
	CodeXml,
	ComponentIcon,
	Database,
	Gauge,
	Package,
	ScrollText,
	Server,
	TriangleAlert,
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
import { useNubeSDKEventsContext } from "@/contexts/nube-sdk-events-context";
import { useNubeSDKLogs } from "@/contexts/nube-sdk-logs-context";
import { useNubeSDKPerformance } from "@/contexts/nube-sdk-performance-context";
import packageData from "../../../package.json";

const Badge = ({
	text,
	className,
	title,
}: { text: string; className?: string; title?: string }) => {
	return (
		<BadgeComponent
			className={`text-[10px] px-1 py-0.5 ${className ?? ""}`}
			variant="destructive"
			title={title}
		>
			{text}
		</BadgeComponent>
	);
};

/** Icon + count without a fill, like the browser console counters. */
const Counter = ({
	count,
	icon: Icon,
	className,
	title,
}: {
	count: number;
	icon?: React.ElementType;
	className: string;
	title: string;
}) => {
	return (
		<span
			className={`inline-flex items-center gap-0.5 text-[11px] font-medium tabular-nums ${className}`}
			title={title}
		>
			{Icon && <Icon className="size-3" />}
			{formatCount(count)}
		</span>
	);
};

/** Muted: a plain tally, not something that needs attention. */
const NEUTRAL_COUNTER_CLASS = "text-muted-foreground";
const ERROR_COUNTER_CLASS = "text-red-500 dark:text-red-400";
/** Amber rather than red: a warning, not an error. */
const WARNING_COUNTER_CLASS = "text-amber-600 dark:text-amber-500";

/** Keeps a badge narrow enough for the sidebar. */
function formatCount(count: number): string {
	return count > 99 ? "99+" : String(count);
}

function plural(count: number, word: string): string {
	return `${count} ${word}${count === 1 ? "" : "s"}`;
}

const menu: {
	title: string;
	page: Page;
	icon: React.ElementType;
	badge?: string;
}[] = [
	{
		title: "Apps",
		page: PAGES.APPS,
		icon: Package,
	},
	{
		title: "Local Mode",
		page: PAGES.LOCAL_MODE,
		icon: Server,
	},
	{
		title: "Components",
		page: PAGES.COMPONENTS,
		icon: ComponentIcon,
	},
	{
		title: "Logs",
		page: PAGES.LOGS,
		icon: ScrollText,
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
		title: "API Calls",
		page: PAGES.API_CALLS,
		icon: ArrowRightLeft,
	},
	{
		title: "Performance",
		page: PAGES.PERFORMANCE,
		icon: Gauge,
	},
	{
		title: "SVG Converter",
		page: PAGES.SVG_CONVERT,
		icon: CodeXml,
	},
	{
		title: "State",
		page: PAGES.STATE,
		icon: Braces,
	},
];

export function AppSidebar() {
	const { currentPage, navigate } = useNavigation();
	const { errorCount, warnCount } = useNubeSDKLogs();
	const { poorCount } = useNubeSDKPerformance();
	const { events } = useNubeSDKEventsContext();

	const getItemBadge = (item: (typeof menu)[number]) => {
		if (item.page === PAGES.LOGS && (errorCount > 0 || warnCount > 0)) {
			// Errors and warnings side by side, like the browser console.
			return (
				<span className="flex items-center gap-2">
					{errorCount > 0 && (
						<Counter
							count={errorCount}
							icon={CircleX}
							className={ERROR_COUNTER_CLASS}
							title={plural(errorCount, "error")}
						/>
					)}
					{warnCount > 0 && (
						<Counter
							count={warnCount}
							icon={TriangleAlert}
							className={WARNING_COUNTER_CLASS}
							title={plural(warnCount, "warning")}
						/>
					)}
				</span>
			);
		}
		if (item.page === PAGES.EVENTS && events.length > 0) {
			return (
				<Counter
					count={events.length}
					className={NEUTRAL_COUNTER_CLASS}
					title={plural(events.length, "event")}
				/>
			);
		}
		if (item.page === PAGES.PERFORMANCE && poorCount > 0) {
			// Over budget is a warning, not an error.
			return (
				<Counter
					count={poorCount}
					icon={TriangleAlert}
					className={WARNING_COUNTER_CLASS}
					title={`${poorCount} over budget`}
				/>
			);
		}
		if (item.badge) {
			return <Badge text={item.badge} />;
		}
		return null;
	};

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
												<div className="flex items-center justify-between w-full">
													<span className="font-bold text-primary">
														{item.title}
													</span>
													{getItemBadge(item)}
												</div>
											) : (
												<div className="flex items-center justify-between w-full">
													<span className="font-light">{item.title}</span>
													{getItemBadge(item)}
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
			<SidebarFooter>
				<span className="text-xs text-muted-foreground text-center">
					v{packageData.version}
				</span>
			</SidebarFooter>
		</Sidebar>
	);
}
