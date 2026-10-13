import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	ERROR_LEVELS,
	type LogEntry,
	type LogLevel,
	useNubeSDKLogs,
} from "@/contexts/nube-sdk-logs-context";
import Layout from "@/devtools/components/layout";
import { PanelDirectionToggle } from "@/devtools/components/panel-direction-toggle";
import { formatAbsoluteDateTime } from "@/devtools/components/relative-time";
import { SearchInput } from "@/devtools/components/search-input";
import { usePanelDirection } from "@/hooks/use-panel-direction";
import { copyToClipboard, downloadFile } from "@/utils/file-utils";
import {
	CopyIcon,
	DownloadIcon,
	FilterIcon,
	InfoIcon,
	ScrollTextIcon,
	TrashIcon,
} from "lucide-react";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const PANEL_WIDTH_KEY = "nube-devtools-logs-page-width";
const SEARCH_STORAGE_KEY = "nube-devtools-logs-filter-search";

const FILTER_SELECT_CLASS =
	"h-5 shrink-0 rounded border bg-transparent px-1.5 text-[12px] outline-none";

const ALL = "all";

type LevelFilter = typeof ALL | LogLevel;

/** Most severe first, the order the level filter lists them in. */
const LEVELS: LogLevel[] = ["FATAL", "ERROR", "WARN", "INFO", "DEBUG", "TRACE"];

const LEVEL_LABEL: Record<LogLevel, string> = {
	FATAL: "Fatal",
	ERROR: "Error",
	WARN: "Warning",
	INFO: "Info",
	DEBUG: "Debug",
	TRACE: "Trace",
};

const SOURCE_LABEL: Record<string, string> = {
	// Reported by the app's worker.
	"app-init": "App init",
	"event-listener": "Event listener",
	"state-modifier": "State modifier",
	"internal-command": "nube.api call",
	"overwritten-console-log": "console",
	"unhandled-error": "Uncaught error",
	"unhandled-rejection": "Unhandled rejection",
	// Reported by the SDK about something it did, or refused to do, for the app.
	"worker-error": "Worker error",
	navigate: "Navigation",
	iframe: "Iframe",
	form: "Form",
	customization: "Customization",
};

const LEVEL_TEXT_CLASS: Record<LogLevel, string> = {
	FATAL: "text-destructive",
	ERROR: "text-destructive",
	WARN: "text-amber-700 dark:text-amber-300",
	INFO: "text-sky-700 dark:text-sky-300",
	DEBUG: "text-muted-foreground",
	TRACE: "text-muted-foreground",
};

const LEVEL_BADGE_CLASS: Record<LogLevel, string> = {
	FATAL: "border-destructive/40 bg-destructive/10 text-destructive",
	ERROR: "border-destructive/40 bg-destructive/10 text-destructive",
	WARN: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
	INFO: "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300",
	DEBUG: "text-muted-foreground",
	TRACE: "text-muted-foreground",
};

/** Row tint, so errors stand out in a long list like they do in the console. */
const LEVEL_ROW_CLASS: Partial<Record<LogLevel, string>> = {
	FATAL: "bg-destructive/5",
	ERROR: "bg-destructive/5",
	WARN: "bg-amber-500/5",
};

function sourceLabel(source: string): string {
	return SOURCE_LABEL[source] ?? source;
}

/** Clock time with milliseconds: logs from one page load share the date. */
function formatTime(timestamp: number): string {
	const date = new Date(timestamp);
	const pad = (value: number, size = 2) => String(value).padStart(size, "0");
	return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
		date.getSeconds(),
	)}.${pad(date.getMilliseconds(), 3)}`;
}

/** What gets copied: the message, and the stack when there is one. */
function logText(log: LogEntry): string {
	if (!log.stack) return log.message;
	// A stack usually starts by repeating the message.
	return log.stack.includes(log.message)
		? log.stack
		: `${log.message}\n${log.stack}`;
}

export function Logs() {
	const { direction, toggleDirection, autoSaveId } =
		usePanelDirection(PANEL_WIDTH_KEY);
	const { logs, isLoading, clearLogs } = useNubeSDKLogs();

	const [selectedSeq, setSelectedSeq] = useState<number | null>(null);
	const [search, setSearch] = useState(
		() => localStorage.getItem(SEARCH_STORAGE_KEY) || "",
	);
	const [levelFilter, setLevelFilter] = useState<LevelFilter>(ALL);
	const [appFilter, setAppFilter] = useState<string>(ALL);
	const [sourceFilter, setSourceFilter] = useState<string>(ALL);

	useEffect(() => {
		localStorage.setItem(SEARCH_STORAGE_KEY, search);
	}, [search]);

	const appIds = useMemo(
		() => [...new Set(logs.map((log) => log.app))].sort(),
		[logs],
	);

	const sources = useMemo(
		() => [...new Set(logs.map((log) => log.source))].sort(),
		[logs],
	);

	const visibleLogs = useMemo(() => {
		const term = search.trim().toLowerCase();

		return logs.filter((log) => {
			if (levelFilter !== ALL && log.level !== levelFilter) return false;
			if (appFilter !== ALL && log.app !== appFilter) return false;
			if (sourceFilter !== ALL && log.source !== sourceFilter) return false;
			if (!term) return true;
			return (
				log.message.toLowerCase().includes(term) ||
				log.app.toLowerCase().includes(term) ||
				(log.event?.toLowerCase().includes(term) ?? false)
			);
		});
	}, [logs, search, levelFilter, appFilter, sourceFilter]);

	const selectedLog = useMemo(
		() => logs.find((log) => log.seq === selectedSeq) ?? null,
		[logs, selectedSeq],
	);

	const handleClear = () => {
		setSelectedSeq(null);
		// The app and source may not come back, and their options go with the
		// logs.
		setAppFilter(ALL);
		setSourceFilter(ALL);
		clearLogs();
	};

	const handleExport = () => {
		const report = {
			exportedAt: new Date().toISOString(),
			logs: visibleLogs,
		};
		downloadFile(
			JSON.stringify(report, null, 2),
			`nube-logs-${Date.now()}.json`,
			(message) => toast.success(message),
		);
	};

	return (
		<Layout>
			<div className="flex h-full flex-col">
				<nav className="flex items-center justify-between px-1.5 py-1 border-b h-8.25 shrink-0">
					<div className="flex items-center min-w-0">
						<SidebarTrigger />
						<Divider />
						<Button
							disabled={logs.length === 0}
							variant="ghost"
							size="icon"
							className="h-6 w-6"
							title="Clear the list"
							onClick={handleClear}
						>
							<TrashIcon className="size-3" />
						</Button>
						<Button
							disabled={visibleLogs.length === 0}
							variant="ghost"
							size="icon"
							className="h-6 w-6"
							title="Export the visible logs as JSON"
							onClick={handleExport}
						>
							<DownloadIcon className="size-3" />
						</Button>
						<Divider />
						<ScrollTextIcon className="size-3 shrink-0" />
						<span className="ml-1.5 text-xs font-medium">Logs</span>
						<span className="ml-2 text-xs text-muted-foreground truncate hidden sm:inline">
							Errors and logs reported by your apps
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
								<TooltipContent className="max-w-xs space-y-1">
									<p>
										What your apps send to <code>console.error</code>, and
										uncaught errors and unhandled rejections in their workers.
										Errors thrown by event listeners, state modifiers, the app
										entrypoint and <code>nube.api</code> calls are only reported
										by telemetry-enabled SDK builds.
									</p>
									<p>
										Also what the SDK refused to do for them: apps that failed
										to load, rejected navigations, iframe messages and form
										actions it dropped, and customizations it did not apply.
									</p>
									<p>
										Requires an SDK version with the devtools log channel; older
										versions show no logs.
									</p>
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
							placeholder="Filter by message, app or event..."
						/>
					</div>
					<FilterIcon className="size-3 text-muted-foreground shrink-0 ml-1" />
					<select
						aria-label="Level"
						className={FILTER_SELECT_CLASS}
						value={levelFilter}
						onChange={(event) =>
							setLevelFilter(event.target.value as LevelFilter)
						}
					>
						<option value={ALL}>All levels</option>
						{LEVELS.map((level) => (
							<option key={level} value={level}>
								{LEVEL_LABEL[level]}
							</option>
						))}
					</select>
					<select
						aria-label="Source"
						className={`${FILTER_SELECT_CLASS} max-w-45`}
						value={sourceFilter}
						onChange={(event) => setSourceFilter(event.target.value)}
					>
						<option value={ALL}>All sources</option>
						{sources.map((source) => (
							<option key={source} value={source}>
								{sourceLabel(source)}
							</option>
						))}
					</select>
					<select
						aria-label="App"
						className={`${FILTER_SELECT_CLASS} max-w-45`}
						value={appFilter}
						onChange={(event) => setAppFilter(event.target.value)}
					>
						<option value={ALL}>All apps</option>
						{appIds.map((appId) => (
							<option key={appId} value={appId}>
								{appId}
							</option>
						))}
					</select>
				</div>

				<AppSummary
					logs={logs}
					selectedAppId={appFilter === ALL ? null : appFilter}
					onSelectApp={(appId) =>
						setAppFilter((current) => (current === appId ? ALL : appId))
					}
				/>

				<div className="flex-1 overflow-hidden">
					<ResizablePanelGroup
						key={direction}
						autoSaveId={autoSaveId}
						storage={localStorage}
						direction={direction}
					>
						<ResizablePanel defaultSize={60}>
							<LogList
								logs={visibleLogs}
								total={logs.length}
								isLoading={isLoading}
								selectedSeq={selectedLog?.seq ?? null}
								onSelect={(log) => setSelectedSeq(log.seq)}
							/>
						</ResizablePanel>
						<ResizableHandle />
						<ResizablePanel>
							<LogDetail log={selectedLog} />
						</ResizablePanel>
					</ResizablePanelGroup>
				</div>
			</div>
		</Layout>
	);
}

type AppCounts = {
	appId: string;
	errors: number;
	warnings: number;
	others: number;
	last: number;
};

function summarize(logs: LogEntry[]): AppCounts[] {
	const byApp = new Map<string, AppCounts>();
	for (const log of logs) {
		const counts = byApp.get(log.app) ?? {
			appId: log.app,
			errors: 0,
			warnings: 0,
			others: 0,
			last: 0,
		};
		if (ERROR_LEVELS.has(log.level)) counts.errors++;
		else if (log.level === "WARN") counts.warnings++;
		else counts.others++;
		counts.last = Math.max(counts.last, log.timestamp);
		byApp.set(log.app, counts);
	}

	return [...byApp.values()].sort((a, b) => a.appId.localeCompare(b.appId));
}

type AppSummaryProps = {
	logs: LogEntry[];
	selectedAppId: string | null;
	onSelectApp: (appId: string) => void;
};

function AppSummary({ logs, selectedAppId, onSelectApp }: AppSummaryProps) {
	const counts = useMemo(() => summarize(logs), [logs]);

	if (counts.length === 0) return null;

	return (
		<div className="border-b shrink-0 max-h-40 overflow-y-auto">
			<table className="w-full text-[11px]">
				<thead className="sticky top-0 bg-background">
					<tr className="text-[10px] uppercase tracking-wide text-muted-foreground">
						<SummaryHeader align="left">App</SummaryHeader>
						<SummaryHeader title="Error and fatal logs">Errors</SummaryHeader>
						<SummaryHeader title="Warning logs">Warnings</SummaryHeader>
						<SummaryHeader title="Info, debug and trace logs">
							Other
						</SummaryHeader>
						<SummaryHeader title="Time of the app's latest log">
							Last
						</SummaryHeader>
					</tr>
				</thead>
				<tbody>
					{counts.map((app) => (
						<tr
							key={app.appId}
							className={`border-t hover:bg-accent/50 ${
								selectedAppId === app.appId
									? "shadow-[inset_2px_0_0_0_rgb(180,83,9)] bg-accent/30"
									: ""
							}`}
						>
							<td className="px-3 py-1 max-w-40">
								<button
									type="button"
									onClick={() => onSelectApp(app.appId)}
									className="block w-full truncate text-left cursor-pointer hover:underline"
									title={`Filter the list by ${app.appId}`}
								>
									{app.appId}
								</button>
							</td>
							<CountCell
								value={app.errors}
								className={LEVEL_TEXT_CLASS.ERROR}
							/>
							<CountCell
								value={app.warnings}
								className={LEVEL_TEXT_CLASS.WARN}
							/>
							<CountCell value={app.others} />
							<td className="px-3 py-1 text-right tabular-nums text-muted-foreground">
								{formatTime(app.last)}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

function SummaryHeader({
	children,
	title,
	align = "right",
}: {
	children: ReactNode;
	title?: string;
	align?: "left" | "right";
}) {
	return (
		<th
			className={`px-3 py-1 font-normal ${align === "left" ? "text-left" : "text-right"}`}
			title={title}
		>
			{children}
		</th>
	);
}

/** A zero is muted; a count gets its level's color. */
function CountCell({
	value,
	className,
}: { value: number; className?: string }) {
	return (
		<td
			className={`px-3 py-1 text-right tabular-nums ${
				value > 0 ? className ?? "" : "text-muted-foreground"
			}`}
		>
			{value}
		</td>
	);
}

type LogListProps = {
	logs: LogEntry[];
	total: number;
	isLoading: boolean;
	selectedSeq: number | null;
	onSelect: (log: LogEntry) => void;
};

function LogList({
	logs,
	total,
	isLoading,
	selectedSeq,
	onSelect,
}: LogListProps) {
	if (logs.length === 0) {
		if (isLoading) {
			return (
				<div className="flex h-full items-center justify-center px-4">
					<p className="text-xs text-muted-foreground">
						Reading the page's logs...
					</p>
				</div>
			);
		}

		if (total === 0) {
			return (
				<div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
					<p className="text-sm">No logs yet</p>
					<p className="text-xs text-muted-foreground max-w-xs">
						Logs appear as your apps report errors, or the SDK rejects something
						they asked for. Reload to capture the page load.
					</p>
					<Button
						variant="outline"
						size="sm"
						className="h-5 px-2 text-xs"
						onClick={() => chrome.devtools.inspectedWindow.reload()}
					>
						Reload page
					</Button>
				</div>
			);
		}

		return (
			<div className="flex h-full items-center justify-center px-4">
				<p className="text-xs text-muted-foreground">
					No log matches the current filters.
				</p>
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col">
			<div className="flex items-center justify-between px-3 py-1.5 border-b shrink-0">
				<span className="text-[10px] uppercase tracking-wide text-muted-foreground">
					Logs
				</span>
				<span className="text-xs">
					{logs.length} {logs.length === 1 ? "log" : "logs"}
					{logs.length !== total ? ` of ${total}` : ""}
				</span>
			</div>
			<ul className="flex-1 overflow-y-auto">
				{logs.map((log) => (
					<LogRow
						key={log.seq}
						log={log}
						isSelected={log.seq === selectedSeq}
						onSelect={onSelect}
					/>
				))}
			</ul>
		</div>
	);
}

type LogRowProps = {
	log: LogEntry;
	isSelected: boolean;
	onSelect: (log: LogEntry) => void;
};

function LogRow({ log, isSelected, onSelect }: LogRowProps) {
	const details = [sourceLabel(log.source), log.app, log.event]
		.filter(Boolean)
		.join(" · ");

	return (
		<li>
			<button
				type="button"
				onClick={() => onSelect(log)}
				className={`flex w-full items-center gap-2 px-3 py-1.5 text-left border-b hover:bg-accent/50 cursor-pointer ${
					isSelected
						? "shadow-[inset_2px_0_0_0_rgb(180,83,9)] bg-accent/30"
						: LEVEL_ROW_CLASS[log.level] ?? ""
				}`}
			>
				<span
					className={`shrink-0 w-12 text-[10px] font-medium uppercase ${LEVEL_TEXT_CLASS[log.level]}`}
				>
					{log.level}
				</span>
				<div className="min-w-0 flex-1">
					<div
						className="truncate text-xs font-medium font-mono"
						title={log.message}
					>
						{log.message || (
							<span className="text-muted-foreground">(empty)</span>
						)}
					</div>
					<div
						className="truncate text-[11px] text-muted-foreground"
						title={details}
					>
						{details}
					</div>
				</div>
				<span className="shrink-0 text-right text-[11px] tabular-nums text-muted-foreground">
					{formatTime(log.timestamp)}
				</span>
			</button>
		</li>
	);
}

function LogDetail({ log }: { log: LogEntry | null }) {
	if (!log) {
		return (
			<div className="flex h-full items-center justify-center px-4">
				<p className="text-xs text-muted-foreground">
					Select a log to inspect its details.
				</p>
			</div>
		);
	}

	const handleCopy = () => {
		copyToClipboard(
			logText(log),
			() => toast.success("Log copied to clipboard"),
			(error) => toast.error(error),
		);
	};

	return (
		<div className="flex h-full flex-col">
			<div className="flex items-center justify-between gap-2 px-3 py-1.5 border-b shrink-0">
				<div className="min-w-0">
					<span className="text-[10px] uppercase tracking-wide text-muted-foreground">
						{sourceLabel(log.source)}
					</span>
					<div
						className="truncate text-xs font-medium font-mono"
						title={log.message}
					>
						{log.message || "(empty)"}
					</div>
				</div>
				<div className="flex items-center gap-1 shrink-0">
					<Badge
						variant="outline"
						className={`text-[10px] px-1 py-0.5 ${LEVEL_BADGE_CLASS[log.level]}`}
					>
						{LEVEL_LABEL[log.level]}
					</Badge>
					<Button
						variant="ghost"
						size="icon"
						className="h-6 w-6"
						title="Copy the message and stack"
						onClick={handleCopy}
					>
						<CopyIcon className="size-3" />
					</Button>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto p-3 space-y-3">
				<div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-[11px]">
					<span className="text-muted-foreground">App</span>
					<span className="break-all">{log.app}</span>
					<span className="text-muted-foreground">Level</span>
					<span className={LEVEL_TEXT_CLASS[log.level]}>
						{LEVEL_LABEL[log.level]}
					</span>
					<span className="text-muted-foreground">Time</span>
					<span>
						{formatAbsoluteDateTime(log.timestamp)}
						<span className="text-muted-foreground">
							{" "}
							· {formatTime(log.timestamp)}
						</span>
					</span>
					<span className="text-muted-foreground">Source</span>
					<span className="font-mono">{log.source}</span>
					{log.event && (
						<>
							<span className="text-muted-foreground">Event</span>
							<span className="font-mono">{log.event}</span>
						</>
					)}
				</div>

				<div className="space-y-1">
					<span className="text-[10px] uppercase tracking-wide text-muted-foreground">
						Message
					</span>
					<pre className="rounded border px-2 py-1.5 text-xs font-mono whitespace-pre-wrap wrap-break-word">
						{log.message || "(empty)"}
					</pre>
				</div>

				{log.stack && (
					<div className="space-y-1">
						<span className="text-[10px] uppercase tracking-wide text-muted-foreground">
							Stack trace
						</span>
						<pre
							className={`rounded border px-2 py-1.5 text-[11px] font-mono whitespace-pre overflow-x-auto ${
								ERROR_LEVELS.has(log.level)
									? "border-destructive/40 bg-destructive/10"
									: ""
							}`}
						>
							{log.stack}
						</pre>
					</div>
				)}
			</div>
		</div>
	);
}
