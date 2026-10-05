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
	type PerformanceEntry,
	type PerformanceEntryKind,
	useNubeSDKPerformance,
} from "@/contexts/nube-sdk-performance-context";
import Layout from "@/devtools/components/layout";
import { PanelDirectionToggle } from "@/devtools/components/panel-direction-toggle";
import { formatAbsoluteDateTime } from "@/devtools/components/relative-time";
import { SearchInput } from "@/devtools/components/search-input";
import { usePanelDirection } from "@/hooks/use-panel-direction";
import { downloadFile } from "@/utils/file-utils";
import {
	ASYNC_BUDGET,
	type PerformanceBudget,
	type PerformanceRating,
	SYNC_BUDGET,
	formatMs,
	percentile,
	rate,
} from "@/utils/performance-budget";
import {
	DownloadIcon,
	FilterIcon,
	GaugeIcon,
	InfoIcon,
	TrashIcon,
	XIcon,
} from "lucide-react";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const PANEL_WIDTH_KEY = "nube-devtools-performance-page-width";
const SEARCH_STORAGE_KEY = "nube-devtools-performance-filter-search";
const BANNER_DISMISSED_KEY = "nube-devtools-performance-banner-dismissed";

const FILTER_SELECT_CLASS =
	"h-5 shrink-0 rounded border bg-transparent px-1.5 text-[12px] outline-none";

const ALL = "all";

type KindFilter = typeof ALL | PerformanceEntryKind;
type RatingFilter = typeof ALL | PerformanceRating;
type SortOrder = "time" | "duration";

const KIND_LABEL: Record<PerformanceEntryKind, string> = {
	network: "Network",
	"api-call": "API call",
	script: "Script",
	lifecycle: "Lifecycle",
};

const RATING_LABEL: Record<PerformanceRating, string> = {
	good: "Good",
	"needs-improvement": "Needs improvement",
	poor: "Poor",
};

const RATING_TEXT_CLASS: Record<PerformanceRating, string> = {
	good: "text-emerald-700 dark:text-emerald-300",
	"needs-improvement": "text-amber-700 dark:text-amber-300",
	poor: "text-destructive",
};

const RATING_BADGE_CLASS: Record<PerformanceRating, string> = {
	good: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
	"needs-improvement":
		"border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
	poor: "border-destructive/40 bg-destructive/10 text-destructive",
};

const RATING_BAR_CLASS: Record<PerformanceRating, string> = {
	good: "bg-emerald-500",
	"needs-improvement": "bg-amber-500",
	poor: "bg-destructive",
};

function readDismissed(): boolean {
	try {
		return localStorage.getItem(BANNER_DISMISSED_KEY) === "true";
	} catch {
		return false;
	}
}

export function Performance() {
	const { direction, toggleDirection, autoSaveId } =
		usePanelDirection(PANEL_WIDTH_KEY);
	const { entries, isLoading, clearEntries } = useNubeSDKPerformance();

	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [search, setSearch] = useState(
		() => localStorage.getItem(SEARCH_STORAGE_KEY) || "",
	);
	const [kindFilter, setKindFilter] = useState<KindFilter>(ALL);
	const [ratingFilter, setRatingFilter] = useState<RatingFilter>(ALL);
	const [appFilter, setAppFilter] = useState<string>(ALL);
	const [sortOrder, setSortOrder] = useState<SortOrder>("time");
	const [bannerDismissed, setBannerDismissed] = useState(readDismissed);

	useEffect(() => {
		localStorage.setItem(SEARCH_STORAGE_KEY, search);
	}, [search]);

	const appIds = useMemo(
		() => [...new Set(entries.map((entry) => entry.appId))].sort(),
		[entries],
	);

	const visibleEntries = useMemo(() => {
		const term = search.trim().toLowerCase();

		const filtered = entries.filter((entry) => {
			if (kindFilter !== ALL && entry.kind !== kindFilter) return false;
			if (ratingFilter !== ALL && entry.rating !== ratingFilter) return false;
			if (appFilter !== ALL && entry.appId !== appFilter) return false;
			if (!term) return true;
			return (
				entry.name.toLowerCase().includes(term) ||
				entry.appId.toLowerCase().includes(term)
			);
		});

		// Start time keeps the waterfall readable; duration puts the worst
		// offenders on top.
		return sortOrder === "duration"
			? [...filtered].sort((a, b) => b.duration - a.duration)
			: filtered;
	}, [entries, search, kindFilter, ratingFilter, appFilter, sortOrder]);

	const selectedEntry = useMemo(
		() => entries.find((entry) => entry.id === selectedId) ?? null,
		[entries, selectedId],
	);

	const handleClear = () => {
		setSelectedId(null);
		// The app may not come back, and its option goes with the entries.
		setAppFilter(ALL);
		clearEntries();
	};

	const handleExport = () => {
		const report = {
			exportedAt: new Date().toISOString(),
			budgets: { sync: SYNC_BUDGET, async: ASYNC_BUDGET },
			entries: visibleEntries,
		};
		downloadFile(
			JSON.stringify(report, null, 2),
			`nube-performance-${Date.now()}.json`,
			(message) => toast.success(message),
		);
	};

	const dismissBanner = () => {
		setBannerDismissed(true);
		try {
			localStorage.setItem(BANNER_DISMISSED_KEY, "true");
		} catch {
			// Shown again next time; nothing else depends on it.
		}
	};

	return (
		<Layout>
			<div className="flex h-full flex-col">
				<nav className="flex items-center justify-between px-1.5 py-1 border-b h-[33px] shrink-0">
					<div className="flex items-center min-w-0">
						<SidebarTrigger />
						<Divider />
						<Button
							disabled={entries.length === 0}
							variant="ghost"
							size="icon"
							className="h-6 w-6"
							title="Clear the list"
							onClick={handleClear}
						>
							<TrashIcon className="size-3" />
						</Button>
						<Button
							disabled={visibleEntries.length === 0}
							variant="ghost"
							size="icon"
							className="h-6 w-6"
							title="Export the visible entries as JSON"
							onClick={handleExport}
						>
							<DownloadIcon className="size-3" />
						</Button>
						<Divider />
						<GaugeIcon className="size-3 shrink-0" />
						<span className="ml-1.5 text-xs font-medium">Performance</span>
						<span className="ml-2 text-xs text-muted-foreground truncate hidden sm:inline">
							How long your apps take to load, render and respond
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
										Requests your apps make with <code>fetch</code>, their{" "}
										<code>nube.api</code> calls, and the time from worker start
										to first render. App init and handler timings are only
										reported by telemetry-enabled SDK builds.
									</p>
									<p>
										Ratings follow reference budgets, not NubeSDK limits.
										Handlers: {SYNC_BUDGET.reference}. Everything else:{" "}
										{ASYNC_BUDGET.reference}.
									</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</div>
				</nav>

				{!bannerDismissed && (
					<div className="flex items-center gap-2 px-3 py-1 border-b shrink-0 bg-amber-500/10 text-[11px] text-amber-800 dark:text-amber-200">
						<InfoIcon className="size-3 shrink-0" />
						<span className="flex-1">
							Timings are measured with DevTools attached and may be higher than
							in production.
						</span>
						<Button
							variant="ghost"
							size="icon"
							className="h-4 w-4"
							title="Dismiss"
							onClick={dismissBanner}
						>
							<XIcon className="size-3" />
						</Button>
					</div>
				)}

				<div className="flex items-center gap-1 px-1.5 py-1 border-b shrink-0">
					<div className="flex items-center flex-1 min-w-0 max-w-xs">
						<SearchInput
							value={search}
							onChange={setSearch}
							placeholder="Filter by name or app..."
						/>
					</div>
					<FilterIcon className="size-3 text-muted-foreground shrink-0 ml-1" />
					<select
						aria-label="Type"
						className={FILTER_SELECT_CLASS}
						value={kindFilter}
						onChange={(event) =>
							setKindFilter(event.target.value as KindFilter)
						}
					>
						<option value={ALL}>All types</option>
						{(Object.keys(KIND_LABEL) as PerformanceEntryKind[]).map((kind) => (
							<option key={kind} value={kind}>
								{KIND_LABEL[kind]}
							</option>
						))}
					</select>
					<select
						aria-label="Rating"
						className={FILTER_SELECT_CLASS}
						value={ratingFilter}
						onChange={(event) =>
							setRatingFilter(event.target.value as RatingFilter)
						}
					>
						<option value={ALL}>All ratings</option>
						{(Object.keys(RATING_LABEL) as PerformanceRating[]).map(
							(rating) => (
								<option key={rating} value={rating}>
									{RATING_LABEL[rating]}
								</option>
							),
						)}
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
					<select
						aria-label="Sort"
						className={FILTER_SELECT_CLASS}
						value={sortOrder}
						onChange={(event) => setSortOrder(event.target.value as SortOrder)}
					>
						<option value="time">Sort by start</option>
						<option value="duration">Sort by duration</option>
					</select>
				</div>

				<AppSummary
					entries={entries}
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
							<EntryList
								entries={visibleEntries}
								total={entries.length}
								isLoading={isLoading}
								selectedId={selectedEntry?.id ?? null}
								onSelect={(entry) => setSelectedId(entry.id)}
							/>
						</ResizablePanel>
						<ResizableHandle />
						<ResizablePanel>
							<EntryDetail entry={selectedEntry} />
						</ResizablePanel>
					</ResizablePanelGroup>
				</div>
			</div>
		</Layout>
	);
}

type AppMetrics = {
	appId: string;
	firstRender: number | null;
	init: number | null;
	networkCount: number;
	networkP95: number | null;
	apiCallCount: number;
	apiCallP95: number | null;
	slowestHandler: number | null;
	poorCount: number;
};

function summarize(entries: PerformanceEntry[]): AppMetrics[] {
	const byApp = new Map<string, PerformanceEntry[]>();
	for (const entry of entries) {
		const list = byApp.get(entry.appId) ?? [];
		list.push(entry);
		byApp.set(entry.appId, list);
	}

	return [...byApp.entries()]
		.map(([appId, list]) => {
			const durations = (predicate: (entry: PerformanceEntry) => boolean) =>
				list.filter(predicate).map((entry) => entry.duration);

			const network = durations((entry) => entry.kind === "network");
			const apiCalls = durations((entry) => entry.kind === "api-call");
			const handlers = durations(
				(entry) => entry.kind === "script" && entry.source !== "app-init",
			);

			return {
				appId,
				firstRender:
					list.find((entry) => entry.source === "first-render")?.duration ??
					null,
				init:
					list.find(
						(entry) =>
							entry.source === "app-init" && entry.metric === "execution-time",
					)?.duration ?? null,
				networkCount: network.length,
				networkP95: percentile(network, 95),
				apiCallCount: apiCalls.length,
				apiCallP95: percentile(apiCalls, 95),
				slowestHandler: handlers.length > 0 ? Math.max(...handlers) : null,
				poorCount: list.filter((entry) => entry.rating === "poor").length,
			};
		})
		.sort((a, b) => a.appId.localeCompare(b.appId));
}

type AppSummaryProps = {
	entries: PerformanceEntry[];
	selectedAppId: string | null;
	onSelectApp: (appId: string) => void;
};

function AppSummary({ entries, selectedAppId, onSelectApp }: AppSummaryProps) {
	const metrics = useMemo(() => summarize(entries), [entries]);

	if (metrics.length === 0) return null;

	return (
		<div className="border-b shrink-0 max-h-40 overflow-y-auto">
			<table className="w-full text-[11px]">
				<thead className="sticky top-0 bg-background">
					<tr className="text-[10px] uppercase tracking-wide text-muted-foreground">
						<SummaryHeader align="left">App</SummaryHeader>
						<SummaryHeader title="Worker created → first ui:slot:set">
							First render
						</SummaryHeader>
						<SummaryHeader title="App() entrypoint, telemetry builds only">
							Init
						</SummaryHeader>
						<SummaryHeader title="Requests · 95th percentile">
							Network p95
						</SummaryHeader>
						<SummaryHeader title="nube.api calls · 95th percentile">
							API p95
						</SummaryHeader>
						<SummaryHeader title="Slowest handler or modifier, telemetry builds only">
							Slowest handler
						</SummaryHeader>
						<SummaryHeader title="Entries rated poor">Poor</SummaryHeader>
					</tr>
				</thead>
				<tbody>
					{metrics.map((app) => (
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
							<MetricCell value={app.firstRender} budget={ASYNC_BUDGET} />
							<MetricCell value={app.init} budget={ASYNC_BUDGET} />
							<MetricCell
								value={app.networkP95}
								budget={ASYNC_BUDGET}
								count={app.networkCount}
							/>
							<MetricCell
								value={app.apiCallP95}
								budget={ASYNC_BUDGET}
								count={app.apiCallCount}
							/>
							<MetricCell value={app.slowestHandler} budget={SYNC_BUDGET} />
							<td
								className={`px-3 py-1 text-right tabular-nums ${
									app.poorCount > 0 ? RATING_TEXT_CLASS.poor : ""
								}`}
							>
								{app.poorCount}
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

function MetricCell({
	value,
	budget,
	count,
}: {
	value: number | null;
	budget: PerformanceBudget;
	count?: number;
}) {
	const rating = value === null ? null : rate(value, budget);
	return (
		<td
			className={`px-3 py-1 text-right tabular-nums ${rating ? RATING_TEXT_CLASS[rating] : "text-muted-foreground"}`}
		>
			{formatMs(value)}
			{count !== undefined && count > 0 && (
				<span className="text-muted-foreground"> · {count}</span>
			)}
		</td>
	);
}

type EntryListProps = {
	entries: PerformanceEntry[];
	total: number;
	isLoading: boolean;
	selectedId: string | null;
	onSelect: (entry: PerformanceEntry) => void;
};

function EntryList({
	entries,
	total,
	isLoading,
	selectedId,
	onSelect,
}: EntryListProps) {
	// One time axis for every row, so bars line up like a network waterfall.
	const range = useMemo(() => {
		if (entries.length === 0) return { start: 0, span: 1 };
		let start = Number.POSITIVE_INFINITY;
		let end = Number.NEGATIVE_INFINITY;
		for (const entry of entries) {
			start = Math.min(start, entry.startedAt);
			end = Math.max(end, entry.startedAt + entry.duration);
		}
		return { start, span: Math.max(end - start, 1) };
	}, [entries]);

	if (entries.length === 0) {
		if (isLoading) {
			return (
				<div className="flex h-full items-center justify-center px-4">
					<p className="text-xs text-muted-foreground">
						Reading the page's measurements...
					</p>
				</div>
			);
		}

		if (total === 0) {
			return (
				<div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
					<p className="text-sm">No measurements yet</p>
					<p className="text-xs text-muted-foreground max-w-xs">
						Measurements appear as your apps start, render and make requests.
						Reload to capture the page load.
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
					No entry matches the current filters.
				</p>
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col">
			<div className="flex items-center justify-between px-3 py-1.5 border-b shrink-0">
				<span className="text-[10px] uppercase tracking-wide text-muted-foreground">
					Entries
				</span>
				<span className="text-xs">
					{entries.length} {entries.length === 1 ? "entry" : "entries"}
					{entries.length !== total ? ` of ${total}` : ""}
					<span className="text-muted-foreground">
						{" "}
						· {formatMs(range.span)} span
					</span>
				</span>
			</div>
			<ul className="flex-1 overflow-y-auto">
				{entries.map((entry) => (
					<EntryRow
						key={entry.id}
						entry={entry}
						range={range}
						isSelected={entry.id === selectedId}
						onSelect={onSelect}
					/>
				))}
			</ul>
		</div>
	);
}

type EntryRowProps = {
	entry: PerformanceEntry;
	range: { start: number; span: number };
	isSelected: boolean;
	onSelect: (entry: PerformanceEntry) => void;
};

function EntryRow({ entry, range, isSelected, onSelect }: EntryRowProps) {
	const left = ((entry.startedAt - range.start) / range.span) * 100;
	const width = Math.max((entry.duration / range.span) * 100, 0.5);

	return (
		<li>
			<button
				type="button"
				onClick={() => onSelect(entry)}
				className={`flex w-full items-center gap-2 px-3 py-1.5 text-left border-b hover:bg-accent/50 cursor-pointer ${
					isSelected
						? "shadow-[inset_2px_0_0_0_rgb(180,83,9)] bg-accent/30"
						: ""
				}`}
			>
				<div className="min-w-0 flex-1">
					<div
						className="truncate text-xs font-medium font-mono"
						title={entry.name}
					>
						{entry.name}
					</div>
					<div
						className="truncate text-[11px] text-muted-foreground"
						title={entry.appId}
					>
						{KIND_LABEL[entry.kind]} · {entry.appId}
					</div>
				</div>
				<span
					className={`shrink-0 w-14 text-right text-[11px] tabular-nums ${RATING_TEXT_CLASS[entry.rating]}`}
				>
					{formatMs(entry.duration)}
				</span>
				<div
					className="relative shrink-0 w-[30%] h-2 rounded-sm bg-muted"
					title={`${formatMs(entry.startedAt - range.start)} → ${formatMs(
						entry.startedAt - range.start + entry.duration,
					)}`}
				>
					<div
						className={`absolute top-0 h-full rounded-sm ${RATING_BAR_CLASS[entry.rating]}`}
						style={{ left: `${Math.min(left, 99.5)}%`, width: `${width}%` }}
					/>
				</div>
			</button>
		</li>
	);
}

function EntryDetail({ entry }: { entry: PerformanceEntry | null }) {
	if (!entry) {
		return (
			<div className="flex h-full items-center justify-center px-4">
				<p className="text-xs text-muted-foreground">
					Select an entry to inspect its timing.
				</p>
			</div>
		);
	}

	const failed = entry.success === false || entry.error !== undefined;

	return (
		<div className="flex h-full flex-col">
			<div className="flex items-center justify-between gap-2 px-3 py-1.5 border-b shrink-0">
				<div className="min-w-0">
					<span className="text-[10px] uppercase tracking-wide text-muted-foreground">
						{KIND_LABEL[entry.kind]}
					</span>
					<div
						className="truncate text-xs font-medium font-mono"
						title={entry.name}
					>
						{entry.name}
					</div>
				</div>
				<Badge
					variant="outline"
					className={`text-[10px] px-1 py-0.5 shrink-0 ${RATING_BADGE_CLASS[entry.rating]}`}
				>
					{RATING_LABEL[entry.rating]}
				</Badge>
			</div>

			<div className="flex-1 overflow-y-auto p-3 space-y-3">
				<div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-[11px]">
					<span className="text-muted-foreground">App</span>
					<span className="break-all">{entry.appId}</span>
					<span className="text-muted-foreground">Duration</span>
					<span className={`tabular-nums ${RATING_TEXT_CLASS[entry.rating]}`}>
						{formatMs(entry.duration)}
					</span>
					<span className="text-muted-foreground">Started</span>
					<span>{formatAbsoluteDateTime(entry.startedAt)}</span>
					<span className="text-muted-foreground">Source</span>
					<span className="font-mono">{entry.source}</span>
					{entry.metric && (
						<>
							<span className="text-muted-foreground">Metric</span>
							<span className="font-mono">{entry.metric}</span>
						</>
					)}
					{entry.event && (
						<>
							<span className="text-muted-foreground">Event</span>
							<span className="font-mono">{entry.event}</span>
						</>
					)}
					{entry.method && (
						<>
							<span className="text-muted-foreground">Method</span>
							<span className="font-mono">{entry.method}</span>
						</>
					)}
					{entry.url && (
						<>
							<span className="text-muted-foreground">URL</span>
							<span className="font-mono break-all">{entry.url}</span>
						</>
					)}
					{entry.status !== undefined && (
						<>
							<span className="text-muted-foreground">Status</span>
							<span className="tabular-nums">
								{entry.status === 0 && entry.success
									? "0 (opaque response)"
									: entry.status}
							</span>
						</>
					)}
				</div>

				{failed && (
					<div className="rounded border border-destructive/40 bg-destructive/10 px-2 py-1.5 text-xs break-words">
						{entry.error || "Failed"}
					</div>
				)}

				<div className="space-y-1">
					<span className="text-[10px] uppercase tracking-wide text-muted-foreground">
						Budget
					</span>
					<BudgetScale entry={entry} />
					<p className="text-[11px] text-muted-foreground">
						{entry.budget.reference}
					</p>
				</div>
			</div>
		</div>
	);
}

/** The three rating bands, with where this entry falls. */
function BudgetScale({ entry }: { entry: PerformanceEntry }) {
	const { good, poor } = entry.budget;
	const bands: { rating: PerformanceRating; label: string }[] = [
		{ rating: "good", label: `≤ ${formatMs(good)}` },
		{
			rating: "needs-improvement",
			label: `${formatMs(good)} – ${formatMs(poor)}`,
		},
		{ rating: "poor", label: `> ${formatMs(poor)}` },
	];

	return (
		<div className="flex gap-0.5 text-[10px]">
			{bands.map((band) => (
				<div
					key={band.rating}
					className={`flex-1 rounded-sm border px-1.5 py-0.5 text-center ${
						band.rating === entry.rating
							? RATING_BADGE_CLASS[band.rating]
							: "text-muted-foreground"
					}`}
				>
					{band.label}
				</div>
			))}
		</div>
	);
}
