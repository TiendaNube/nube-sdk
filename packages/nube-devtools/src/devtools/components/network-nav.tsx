import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { TrashIcon } from "lucide-react";
import { SearchInput } from "./search-input";

interface NetworkNavProps {
	eventsCount: number;
	filteredEventsCount: number;
	hasHiddenEvents: boolean;
	search: string;
	onSearchChange: (value: string) => void;
	onClear: () => void;
}

export function NetworkNav({
	eventsCount,
	filteredEventsCount,
	hasHiddenEvents,
	search,
	onSearchChange,
	onClear,
}: NetworkNavProps) {
	return (
		<nav className="flex items-center px-1.5 justify-between py-1 border-b h-[33px] shrink-0">
			<div className="flex items-center">
				<SidebarTrigger />
				<Divider />
				<Button
					disabled={eventsCount === 0}
					variant="ghost"
					size="icon"
					className="h-6 w-6"
					onClick={onClear}
				>
					<TrashIcon className="size-3" />
				</Button>
			</div>
			<Divider />
			<SearchInput value={search} onChange={onSearchChange} />
			{eventsCount > 0 && (
				<>
					<Divider />
					<span
						className={`text-xs px-2 whitespace-nowrap ${hasHiddenEvents ? "text-neutral-400" : ""}`}
					>
						{hasHiddenEvents
							? `${eventsCount} hidden`
							: `${filteredEventsCount} ${filteredEventsCount === 1 ? "event" : "events"}`}
					</span>
				</>
			)}
		</nav>
	);
}
