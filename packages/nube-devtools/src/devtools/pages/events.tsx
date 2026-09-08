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
import { SearchInput } from "@/devtools/components/search-input";
import { TrashIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
	const [selectedEvent, setSelectedEvent] = useState<NubeSDKEvent | null>(null);
	const { events, setEvents, clearEvents } = useNubeSDKEventsContext();
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
				events.filter((event) => {
					const eventName = (event.data[1] ?? "").toLowerCase();
					const sender = (event.data[2] ?? "").toLowerCase();
					const target = (event.data[3] ?? "*").toLowerCase();
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
			events.filter((event) => {
				const eventName = (event.data[1] ?? "").toLowerCase();
				const sender = (event.data[2] ?? "").toLowerCase();
				const target = (event.data[3] ?? "").toLowerCase();
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
		const listener = (port: chrome.runtime.Port) => {
			if (port.name === "nube-devtools-events") {
				port.onMessage.addListener((message) => {
					if (message.payload as NubeSDKEventData) {
						setEvents((prevEvents) => {
							return [
								...prevEvents,
								{ id: crypto.randomUUID(), data: message.payload },
							];
						});

						port.disconnect();
					}
				});
			}
		};

		chrome.runtime.onConnect.addListener(listener);

		return () => {
			chrome.runtime.onConnect.removeListener(listener);
		};
	}, []);

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

	const handleReplayEvent = (event: NubeSDKEventData) => {
		chrome.runtime.sendMessage(
			{
				action: "nube-devtools-replay-event",
				payload: {
					tabId: chrome.devtools.inspectedWindow.tabId,
					state: event[0],
					event: event[1],
					appId: event[2],
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

	const hasHiddenEvents =
		filteredEvents.length === 0 && events.length !== filteredEvents.length;

	return (
		<Layout>
			<div className="flex h-full flex-col">
				<nav className="flex items-center px-1.5 justify-between py-1 border-b h-[33px] shrink-0">
					<div className="flex items-center">
						<SidebarTrigger />
						<Divider />
						<Button
							disabled={events.length === 0}
							variant="ghost"
							size="icon"
							className="h-6 w-6"
							onClick={handleClearList}
						>
							<TrashIcon className="size-3" />
						</Button>
					</div>
					<Divider />
					<SearchInput value={search} onChange={setSearch} />
					{events.length > 0 && (
						<>
							<Divider />
							<span
								className={`text-xs px-2 whitespace-nowrap ${hasHiddenEvents ? "text-neutral-400" : ""}`}
							>
								{hasHiddenEvents
									? `${events.length} hidden`
									: `${filteredEvents.length} ${filteredEvents.length === 1 ? "event" : "events"}`}
							</span>
						</>
					)}
				</nav>
				<div className="flex-1 overflow-hidden">
					<ResizablePanelGroup
						autoSaveId={STORAGE_KEY}
						storage={localStorage}
						direction="horizontal"
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
													onResend={(e) => handleReplayEvent(e.data)}
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
								{selectedEvent && (
									<JsonViewer
										className="p-2 text-sm overflow-x-auto"
										data={selectedEvent.data[0]}
										name="state"
										collapsed={1}
									/>
								)}
							</div>
						</ResizablePanel>
					</ResizablePanelGroup>
				</div>
			</div>
		</Layout>
	);
}
