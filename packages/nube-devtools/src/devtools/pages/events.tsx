import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { ResizableHandle, ResizablePanel } from "@/components/ui/resizable";
import { ResizablePanelGroup } from "@/components/ui/resizable";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
	Table,
	TableBody,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNubeSDKEventsContext } from "@/contexts/nube-sdk-events-context";
import type {
	NubeSDKEvent,
	NubeSDKEventData,
} from "@/contexts/nube-sdk-events-context";
import { EmptyState } from "@/devtools/components/empty-state";
import {
	type EventCellField,
	EventTableRow,
} from "@/devtools/components/event-table-row";
import { JsonViewer } from "@/devtools/components/json-viewer";
import Layout from "@/devtools/components/layout";
import { PanelDirectionToggle } from "@/devtools/components/panel-direction-toggle";
import { SearchInput } from "@/devtools/components/search-input";
import { usePanelDirection } from "@/hooks/use-panel-direction";
import { getModifiedPaths } from "@/utils/json-diff";
import { ChartNoAxesGanttIcon, InfoIcon, TrashIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

const STORAGE_KEY = "nube-devtools-events-page-width";
const SEARCH_STORAGE_KEY = "nube-devtools-filter-search";
const COLUMN_WIDTHS_KEY = "nube-devtools-events-column-widths";

type ResizableColumn = "sender" | "target";
type ColumnWidths = Record<ResizableColumn, number>;
const DEFAULT_COLUMN_WIDTHS: ColumnWidths = { sender: 150, target: 150 };
const MIN_COLUMN_WIDTH = 60;

function loadColumnWidths(): ColumnWidths {
	const stored = localStorage.getItem(COLUMN_WIDTHS_KEY);
	if (stored) {
		try {
			const parsed = JSON.parse(stored) as Partial<ColumnWidths>;
			return {
				sender: parsed.sender ?? DEFAULT_COLUMN_WIDTHS.sender,
				target: parsed.target ?? DEFAULT_COLUMN_WIDTHS.target,
			};
		} catch {
			// ignore malformed value and fall back to defaults
		}
	}
	return DEFAULT_COLUMN_WIDTHS;
}

type QueryField = "sender" | "target" | "event";
const QUERY_FIELDS: ReadonlySet<string> = new Set([
	"sender",
	"target",
	"event",
]);
const QUERY_TOKEN_RE = /(\w+)="([^"]*)"/g;

function parseQuery(input: string): Partial<Record<QueryField, string>> | null {
	const trimmed = input.trim();
	if (!trimmed) return null;

	const re = new RegExp(QUERY_TOKEN_RE);
	const result: Partial<Record<QueryField, string>> = {};
	let cursor = 0;
	let match: RegExpExecArray | null = re.exec(trimmed);

	while (match !== null) {
		if (trimmed.slice(cursor, match.index).trim() !== "") return null;
		const [, field, value] = match;
		if (!QUERY_FIELDS.has(field)) return null;
		result[field as QueryField] = value;
		cursor = re.lastIndex;
		match = re.exec(trimmed);
	}

	if (trimmed.slice(cursor).trim() !== "") return null;
	if (Object.keys(result).length === 0) return null;
	return result;
}

const QUERY_FIELD_ORDER: readonly QueryField[] = ["sender", "target", "event"];

function buildQueryString(query: Partial<Record<QueryField, string>>): string {
	return QUERY_FIELD_ORDER.filter((f) => query[f] !== undefined)
		.map((f) => `${f}="${query[f]}"`)
		.join(" ");
}

function addToFilter(
	current: string,
	field: QueryField,
	value: string,
): string {
	const existing = parseQuery(current) ?? {};
	existing[field] = value;
	return buildQueryString(existing);
}

export function Events() {
	const { direction, toggleDirection, autoSaveId } =
		usePanelDirection(STORAGE_KEY);
	const [selectedEvent, setSelectedEvent] = useState<NubeSDKEvent | null>(null);
	const { events, clearEvents } = useNubeSDKEventsContext();
	const [filteredEvents, setFilteredEvents] = useState<NubeSDKEvent[]>([]);
	const [search, setSearch] = useState(() => {
		return localStorage.getItem(SEARCH_STORAGE_KEY) || "";
	});
	const tableContainerRef = useRef<HTMLDivElement>(null);
	const [columnWidths, setColumnWidths] =
		useState<ColumnWidths>(loadColumnWidths);

	useEffect(() => {
		localStorage.setItem(COLUMN_WIDTHS_KEY, JSON.stringify(columnWidths));
	}, [columnWidths]);

	const startColumnResize = (
		column: ResizableColumn,
		event: React.MouseEvent,
	) => {
		event.preventDefault();
		event.stopPropagation();
		const startX = event.clientX;
		const startWidth = columnWidths[column];

		const handleMouseMove = (moveEvent: MouseEvent) => {
			const delta = moveEvent.clientX - startX;
			const nextWidth = Math.max(MIN_COLUMN_WIDTH, startWidth + delta);
			setColumnWidths((prev) => ({ ...prev, [column]: nextWidth }));
		};

		const handleMouseUp = () => {
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
			document.body.style.cursor = "";
			document.body.style.userSelect = "";
		};

		window.addEventListener("mousemove", handleMouseMove);
		window.addEventListener("mouseup", handleMouseUp);
		document.body.style.cursor = "col-resize";
		document.body.style.userSelect = "none";
	};

	useEffect(() => {
		const query = parseQuery(search);
		if (query) {
			const expected = {
				sender: query.sender?.toLowerCase(),
				target: query.target?.toLowerCase(),
				event: query.event?.toLowerCase(),
			};
			setFilteredEvents(
				events.filter(({ record }) => {
					const eventName = (record.event ?? "").toLowerCase();
					const sender = (record.sender ?? "").toLowerCase();
					const target = (record.target ?? "*").toLowerCase();
					if (expected.sender !== undefined && sender !== expected.sender)
						return false;
					if (expected.target !== undefined && target !== expected.target)
						return false;
					if (expected.event !== undefined && eventName !== expected.event)
						return false;
					return true;
				}),
			);
			return;
		}

		const term = search.toLowerCase();
		setFilteredEvents(
			events.filter(({ record }) => {
				const eventName = (record.event ?? "").toLowerCase();
				const sender = (record.sender ?? "").toLowerCase();
				const target = (record.target ?? "").toLowerCase();
				return (
					eventName.includes(term) ||
					sender.includes(term) ||
					target.includes(term)
				);
			}),
		);
	}, [events, search]);

	useEffect(() => {
		localStorage.setItem(SEARCH_STORAGE_KEY, search);
	}, [search]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (tableContainerRef.current) {
			setTimeout(() => {
				if (tableContainerRef.current) {
					tableContainerRef.current.scrollTop =
						tableContainerRef.current.scrollHeight;
				}
			}, 0);
		}
	}, [events]);

	const handleAddToFilter = (field: EventCellField, value: string) => {
		setSearch(addToFilter(search, field, value));
	};

	const handleClearList = () => {
		setSelectedEvent(null);
		clearEvents();
	};

	const handleReplayEvent = (record: NubeSDKEventData) => {
		chrome.runtime.sendMessage(
			{
				action: "nube-devtools-replay-event",
				payload: {
					tabId: chrome.devtools.inspectedWindow.tabId,
					state: record.next,
					event: record.event,
					appId: record.sender,
				},
			},
			(response: { status: boolean }) => {
				if (response.status) {
					toast.success("Event resent successfully");
				} else {
					toast.error("Failed to resend event");
				}
			},
		);
	};

	// What this single event actually changed. `prev`/`next` come straight from
	// the runtime hook, so this is the event's own diff — not a comparison
	// between two `getState()` polls.
	const modifiedPaths = useMemo(() => {
		if (!selectedEvent) return new Set<string>();
		return getModifiedPaths(
			selectedEvent.record.prev,
			selectedEvent.record.next,
		);
	}, [selectedEvent]);

	const hasHiddenEvents =
		filteredEvents.length === 0 && events.length !== filteredEvents.length;

	return (
		<Layout>
			<div className="flex h-full flex-col">
				<nav className="flex items-center justify-between px-1.5 py-1 border-b h-[33px] shrink-0">
					<div className="flex items-center min-w-0">
						<SidebarTrigger />
						<Divider />
						<Button
							disabled={events.length === 0}
							variant="ghost"
							size="icon"
							className="h-6 w-6"
							title="Clear the list"
							onClick={handleClearList}
						>
							<TrashIcon className="size-3" />
						</Button>
						<Divider />
						<ChartNoAxesGanttIcon className="size-3 shrink-0" />
						<span className="ml-1.5 text-xs font-medium">Events</span>
						<span className="ml-2 text-xs text-muted-foreground truncate hidden sm:inline">
							Events dispatched between your apps and the store
						</span>
					</div>
					<div className="flex items-center gap-1.5 shrink-0">
						<PanelDirectionToggle
							direction={direction}
							onToggle={toggleDirection}
						/>
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<span className="inline-flex shrink-0">
										<InfoIcon className="size-3 text-muted-foreground" />
									</span>
								</TooltipTrigger>
								<TooltipContent className="max-w-xs">
									Every event with its sender and target, and the state it
									produced. Modified fields are highlighted in the state viewer.
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</div>
				</nav>

				<div className="flex items-center gap-1 px-1.5 py-1 border-b shrink-0">
					<div className="flex items-center flex-1 min-w-0 max-w-xs">
						<SearchInput
							value={search}
							onChange={setSearch}
							placeholder="Filter by event, sender or target..."
						/>
					</div>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<span className="inline-flex shrink-0 ml-1">
									<InfoIcon className="size-3 text-muted-foreground" />
								</span>
							</TooltipTrigger>
							<TooltipContent className="max-w-xs space-y-1">
								<p>Matches any part of the event name, sender or target.</p>
								<p>
									For exact values, use{" "}
									<code>sender="…" target="…" event="…"</code>, alone or
									combined.
								</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
					{events.length > 0 && (
						<span
							className={`ml-auto text-xs px-1 whitespace-nowrap ${hasHiddenEvents ? "text-muted-foreground" : ""}`}
						>
							{hasHiddenEvents
								? `${events.length} hidden`
								: `${filteredEvents.length} ${filteredEvents.length === 1 ? "event" : "events"}`}
						</span>
					)}
				</div>
				<div className="flex-1 overflow-hidden">
					<ResizablePanelGroup
						key={direction}
						autoSaveId={autoSaveId}
						storage={localStorage}
						direction={direction}
					>
						<ResizablePanel defaultSize={40}>
							{events.length === 0 ? (
								<div className="h-full overflow-y-auto">
									<EmptyState
										text="No events found"
										buttonText="Reload page"
										onButtonClick={() => {
											chrome.devtools.inspectedWindow.reload();
										}}
									/>
								</div>
							) : (
								<div ref={tableContainerRef} className="h-full overflow-y-auto">
									<Table className="table-fixed">
										<TableHeader>
											<TableRow>
												<TableHead
													style={{ width: columnWidths.sender }}
													className="relative h-7 px-3 text-muted-foreground border-r"
												>
													sender
													<button
														type="button"
														onMouseDown={(e) => startColumnResize("sender", e)}
														className="absolute top-0 right-0 h-full w-1.5 translate-x-1/2 cursor-ew-resize border-0 bg-transparent p-0"
													/>
												</TableHead>
												<TableHead
													style={{ width: columnWidths.target }}
													className="relative h-7 px-3 text-muted-foreground border-r"
												>
													target
													<button
														type="button"
														onMouseDown={(e) => startColumnResize("target", e)}
														className="absolute top-0 right-0 h-full w-1.5 translate-x-1/2 cursor-ew-resize border-0 bg-transparent p-0"
													/>
												</TableHead>
												<TableHead className="h-7 px-3 text-muted-foreground">
													event
												</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody className="[&_tr:last-child]:border-b!">
											{filteredEvents.map((event) => (
												<EventTableRow
													key={event.id}
													event={event}
													isSelected={event.id === selectedEvent?.id}
													onSelect={setSelectedEvent}
													onResend={(e) => handleReplayEvent(e.record)}
													onAddToFilter={handleAddToFilter}
												/>
											))}
										</TableBody>
									</Table>
								</div>
							)}
						</ResizablePanel>
						<ResizableHandle />
						<ResizablePanel>
							<div className="h-full overflow-auto">
								{selectedEvent ? (
									<JsonViewer
										className="p-2 text-sm overflow-x-auto"
										data={selectedEvent.record.next}
										name="state"
										collapsed={1}
										modifiedPaths={modifiedPaths}
									/>
								) : (
									<div className="flex h-full items-center justify-center px-4">
										<p className="text-xs text-muted-foreground">
											Select an event to inspect the state it produced.
										</p>
									</div>
								)}
							</div>
						</ResizablePanel>
					</ResizablePanelGroup>
				</div>
			</div>
		</Layout>
	);
}
