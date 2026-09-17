import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Table, TableBody, TableRow } from "@/components/ui/table";
import type { NubeSDKEvent } from "@/contexts/nube-sdk-storage-context";
import { useNubeSDKStorage } from "@/contexts/nube-sdk-storage-context";
import Layout from "@/devtools/components/layout";
import { TrashIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { JsonViewer } from "../components/json-viewer";
import { TableRowItem } from "../components/table-row-item";

const STORAGE_KEY = "nube-devtools-storages-page-width";

const safeJsonParse = (value: string) => {
	try {
		return JSON.parse(value);
	} catch {
		return value;
	}
};

export function Storages() {
	const [selectedEvent, setSelectedEvent] = useState<NubeSDKEvent | null>(null);
	const { events, cleanup } = useNubeSDKStorage();
	const tableContainerRef = useRef<HTMLDivElement>(null);

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

	const handleClearList = () => {
		setSelectedEvent(null);
		cleanup();
	};

	const parsedEventData = useMemo(() => {
		if (!selectedEvent) return {};
		const { value } = selectedEvent.data;
		return {
			...selectedEvent.data,
			// Apps are free to store a plain string, so a parse failure is
			// expected: show the raw value instead of throwing out of render.
			value: value ? safeJsonParse(value) : {},
		};
	}, [selectedEvent]);

	return (
		<Layout>
			<div className="flex h-full flex-col">
				<nav className="flex items-center justify-between px-1.5 py-1 border-b h-[33px] shrink-0">
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
					<span className="text-xs">
						{events.length}{" "}
						{events.length === 1 ? "storage event" : "storage events"}
					</span>
				</nav>
				<div className="flex-1 overflow-hidden">
					<ResizablePanelGroup
						autoSaveId={STORAGE_KEY}
						storage={localStorage}
						direction="horizontal"
					>
						<ResizablePanel defaultSize={40}>
							<div ref={tableContainerRef} className="h-full overflow-y-auto">
								{events.length === 0 ? (
									<div className="flex h-full flex-col items-center justify-center gap-2">
										<p className="text-sm">No storage data found</p>
										<Button
											variant="outline"
											size="sm"
											className="h-5 px-2 text-xs"
											onClick={() => {
												chrome.devtools.inspectedWindow.reload();
											}}
										>
											Reload page
										</Button>
									</div>
								) : (
									<Table className="table-fixed">
										<TableBody>
											{events.map((event) => (
												<TableRow key={event.id}>
													<TableRowItem
														title={event.data.key}
														isSelected={event.id === selectedEvent?.id}
														badge1={event.data.type}
														badge2={event.data.method}
														event={event}
														onSelect={setSelectedEvent}
													/>
												</TableRow>
											))}
										</TableBody>
									</Table>
								)}
							</div>
						</ResizablePanel>
						<ResizableHandle />
						<ResizablePanel>
							<div className="flex h-full overflow-y-auto">
								{selectedEvent && (
									<div className="text-sm">
										<JsonViewer className="p-2" data={parsedEventData} />
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
