import type { ConsoleEvent } from "@/contexts/console-events-context";
import { useEffect, useState } from "react";

const SEARCH_STORAGE_KEY = "nube-devtools-console-events-search";

export function useConsoleFilter(
	events: Array<ConsoleEvent>,
) {
	const [search, setSearch] = useState(() => {
		return localStorage.getItem(SEARCH_STORAGE_KEY) || "";
	});
	const [filteredEvents, setFilteredEvents] = useState<typeof events>([]);

	useEffect(() => {
		setFilteredEvents(
			events.filter((event) => {
				const text = JSON.stringify(event.data);
				return text.includes(search);
			}),
		);
	}, [events, search]);

	useEffect(() => {
		localStorage.setItem(SEARCH_STORAGE_KEY, search);
	}, [search]);

	const hasHiddenEvents =
		filteredEvents.length === 0 && events.length !== filteredEvents.length;

	return {
		search,
		setSearch,
		filteredEvents,
		hasHiddenEvents,
	};
}
