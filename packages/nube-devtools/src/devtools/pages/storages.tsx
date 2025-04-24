import { Button } from "@/components/ui/button";
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
import { v4 as uuidv4 } from "uuid";
import { JsonViewer } from "../components/json-viewer";
import { TableRowItem } from "../components/table-row-item";

const STORAGE_KEY = "nube-devtools-storages-page-width";

export function Storages() {
	const [selectedEvent, setSelectedEvent] = useState<NubeSDKEvent | null>(null);
	const { events, setEvents, cleanup } = useNubeSDKStorage();
	const tableContainerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const listener = (port: chrome.runtime.Port) => {
			if (port.name === "nube-devtools-storage-events") {
				port.onMessage.addListener((message) => {
					if (message.payload) {
						setEvents((prevEvents) => [
							...prevEvents,
							{
								id: uuidv4(),
								data: message.payload,
							},
						]);
						port.disconnect();
					}
				});
			}
		};

		chrome.runtime.onConnect.addListener(listener);

		return () => {
			chrome.runtime.onConnect.removeListener(listener);
		};
	}, [setEvents]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (tableContainerRef.current) {
			tableContainerRef.current.scrollTop =
				tableContainerRef.current.scrollHeight -
				tableContainerRef.current.clientHeight;
		}
	}, [events]);

	const handleClearList = () => {
		setSelectedEvent(null);
		cleanup();
	};

	const parsedEventData = useMemo(() => {
		if (!selectedEvent) return {};
		return {
			...selectedEvent.data,
			value: selectedEvent.data.value
				? JSON.parse(selectedEvent.data.value)
				: {},
		};
	}, [selectedEvent]);

	return (
		<Layout>
			<ResizablePanelGroup
				autoSaveId={STORAGE_KEY}
				storage={localStorage}
				direction="horizontal"
			>
				<ResizablePanel defaultSize={40}>
					<nav className="flex items-center justify-between px-1.5 py-1 border-b">
						<div className="flex items-center">
							<SidebarTrigger />
							<div className="h-4 w-px bg-neutral-600 mx-2" />
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
					<div
						ref={tableContainerRef}
						className="h-[calc(100%-33px)] overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-700 dark:[&::-webkit-scrollbar-thumb:hover]:bg-gray-600"
					>
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
							<Table>
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
					<div className="flex h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
						{selectedEvent && (
							<div className="text-sm">
								<JsonViewer className="p-2" data={parsedEventData} />
							</div>
						)}
					</div>
				</ResizablePanel>
			</ResizablePanelGroup>
		</Layout>
	);
}
