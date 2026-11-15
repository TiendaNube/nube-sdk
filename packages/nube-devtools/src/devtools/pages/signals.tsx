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
import { PAGES, useNavigation } from "@/contexts/navigation-context";
import { useNubeSDKSignals } from "@/contexts/nube-sdk-signals-context";
import { JsonViewer } from "@/devtools/components/json-viewer";
import Layout from "@/devtools/components/layout";
import { PanelDirectionToggle } from "@/devtools/components/panel-direction-toggle";
import { RelativeTime } from "@/devtools/components/relative-time";
import { SearchInput } from "@/devtools/components/search-input";
import { SignalGraphView } from "@/devtools/components/signal-graph-view";
import {
	KIND_ICON,
	KIND_ICON_CLASS,
	SignalId,
} from "@/devtools/components/signal-id";
import { UpdatedAt } from "@/devtools/components/updated-at";
import { useComponentsSnapshot } from "@/devtools/hooks";
import { useChangeHighlight } from "@/hooks/use-change-highlight";
import { usePanelDirection } from "@/hooks/use-panel-direction";
import { PAGE_VIEW, buildComponentTree } from "@/utils/component-tree";
import { formatValue } from "@/utils/conditions";
import { copyToClipboard } from "@/utils/file-utils";
import { getModifiedPaths } from "@/utils/json-diff";
import {
	highlightPageComponents,
	scrollToPageComponent,
} from "@/utils/page-components";
import {
	type SignalBinding,
	type SignalChange,
	type SignalProblem,
	type SignalRow,
	type SignalStatus,
	buildSignalRows,
	collectSignalBindings,
} from "@/utils/signal-bindings";
import { layoutSignalGraph, shortSignalId } from "@/utils/signal-graph";
import {
	CopyIcon,
	CpuIcon,
	InfoIcon,
	ListIcon,
	LocateFixedIcon,
	NetworkIcon,
	PauseIcon,
	PlayIcon,
	RefreshCwIcon,
	Trash2Icon,
	TriangleAlertIcon,
	ZapIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

const PANEL_WIDTH_KEY = "nube-devtools-signals-page-width";

const FILTER_SELECT_CLASS =
	"h-5 shrink-0 rounded border bg-transparent px-1.5 text-[12px] outline-none";

const ALL_APPS = "all";

type View = "list" | "graph";
const VIEW_KEY = "nube-devtools-signals-page-view";

/** How many changes of a signal the history lists, newest first. */
const HISTORY_LIMIT = 50;

const GRID =
	"grid grid-cols-[14px_minmax(110px,1.2fr)_minmax(40px,0.5fr)_minmax(80px,2fr)_40px_56px_64px] items-center gap-x-2";

const STATUS: Record<
	SignalStatus,
	{ label: string; dot: string; description: string }
> = {
	synced: {
		label: "synced",
		dot: "bg-emerald-500",
		description: "The app changed it after rendering; the page has the value.",
	},
	initial: {
		label: "initial",
		dot: "border border-muted-foreground",
		description:
			"Still the value it was rendered with: the app has not changed it since.",
	},
	orphan: {
		label: "orphan",
		dot: "bg-muted-foreground",
		description:
			"The app keeps sending its value, but no slot uses it right now.",
	},
	rejected: {
		label: "rejected",
		dot: "bg-red-500",
		description:
			"An app sent a value for a signal it does not own, and the platform refused it.",
	},
	internal: {
		label: "worker only",
		dot: "border border-dashed border-slate-500 bg-slate-500/30",
		description:
			"The app never passed it to a component, so it never left the app's worker and the page has no value for it.",
	},
};

const PROBLEM: Record<SignalProblem, string> = {
	unsynced:
		"It changed after being rendered, but the app never called useSignals(nube): the page still shows the old value.",
	unserializable:
		"Its value cannot be turned into JSON, so the app could not send it. The page shows the last value that could be sent.",
};

const ROLE_LABEL: Record<SignalBinding["role"], string> = {
	text: "text of",
	prop: "prop of",
	show: "when of",
	match: "value of",
};

function matchesSearch(row: SignalRow, needle: string): boolean {
	return [row.id, row.app, formatValue(row.value, 500)].some((text) =>
		text.toLowerCase().includes(needle),
	);
}

export function Signals() {
	const { direction, toggleDirection, autoSaveId } =
		usePanelDirection(PANEL_WIDTH_KEY);
	const { records, supported, graphs, clearRecords } = useNubeSDKSignals();
	const { snapshot, isLoading, updatedAt, refresh } = useComponentsSnapshot();
	const { focus, clearFocus, navigate } = useNavigation();

	const [app, setApp] = useState(ALL_APPS);
	const [search, setSearch] = useState("");
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [view, setView] = useState<View>(() =>
		// The graph is the way in: it shows how the signals relate before any
		// single one is inspected. The list is one click away, and remembered.
		localStorage.getItem(VIEW_KEY) === "list" ? "list" : "graph",
	);
	useEffect(() => {
		localStorage.setItem(VIEW_KEY, view);
	}, [view]);

	// Pausing freezes what is shown, not what is collected: the provider keeps
	// receiving, and resuming catches up.
	const [paused, setPaused] = useState(false);
	const frozen = useRef({ snapshot, records, graphs });
	if (!paused) frozen.current = { snapshot, records, graphs };
	const shown = frozen.current;

	const rows = useMemo(() => {
		const tree = shown.snapshot
			? buildComponentTree(shown.snapshot, PAGE_VIEW)
			: [];
		return buildSignalRows(
			collectSignalBindings(tree),
			shown.records,
			shown.graphs,
		);
	}, [shown.snapshot, shown.records, shown.graphs]);

	// Apps that render signals nobody is syncing: the one mistake that makes
	// everything else on this page look broken.
	const disconnected = useMemo(
		() =>
			shown.graphs
				.filter(
					(graph) =>
						!graph.connected && graph.signals.some((node) => node.rendered),
				)
				.map((graph) => graph.app),
		[shown.graphs],
	);

	const apps = useMemo(
		() => [...new Set(rows.map((row) => row.app))].sort(),
		[rows],
	);

	const visibleRows = useMemo(() => {
		const needle = search.trim().toLowerCase();
		return rows.filter(
			(row) =>
				(app === ALL_APPS || row.app === app) &&
				(!needle || matchesSearch(row, needle)),
		);
	}, [rows, app, search]);

	const selected = useMemo(
		() => rows.find((row) => row.id === selectedId) ?? null,
		[rows, selectedId],
	);

	// The Components page asked for a signal.
	useEffect(() => {
		if (focus?.page !== PAGES.SIGNALS) return;
		setApp(ALL_APPS);
		setSearch("");
		setSelectedId(focus.target);
		clearFocus();
	}, [focus, clearFocus]);

	// Never leave an outline on the page once the panel moves elsewhere.
	useEffect(() => () => void highlightPageComponents([]), []);

	return (
		<Layout>
			<div className="flex h-full flex-col">
				<nav className="flex items-center justify-between px-1.5 py-1 border-b h-8.25 shrink-0">
					<div className="flex items-center min-w-0">
						<SidebarTrigger />
						<Divider />
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6"
							title="Refresh the signals"
							onClick={async () => {
								if (await refresh()) toast.success("Signals refreshed");
								else toast.error("Could not read the page's signals");
							}}
						>
							<RefreshCwIcon className="size-3" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6"
							title={paused ? "Resume" : "Pause (keeps collecting)"}
							onClick={() => setPaused((value) => !value)}
						>
							{paused ? (
								<PlayIcon className="size-3" />
							) : (
								<PauseIcon className="size-3" />
							)}
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6"
							title="Clear the history of changes"
							onClick={clearRecords}
						>
							<Trash2Icon className="size-3" />
						</Button>
						<Divider />
						<ZapIcon className="size-3 shrink-0" />
						<span className="ml-1.5 text-xs font-medium">Signals</span>
						<span className="ml-2 text-xs text-muted-foreground truncate hidden sm:inline">
							The signals your apps render, and where the page uses them
						</span>
					</div>
					<div className="flex items-center gap-1.5 shrink-0 pr-1">
						{paused && (
							<Badge
								variant="outline"
								className="text-[10px] px-1 py-0 border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
							>
								paused
							</Badge>
						)}
						<UpdatedAt timestamp={updatedAt} />
						<div className="flex items-center rounded border">
							<Button
								variant="ghost"
								size="icon"
								className={`h-5 w-6 rounded-none ${view === "graph" ? "bg-accent" : ""}`}
								title="Graph: how the signals of an app depend on each other"
								aria-pressed={view === "graph"}
								onClick={() => setView("graph")}
							>
								<NetworkIcon className="size-3" />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								className={`h-5 w-6 rounded-none ${view === "list" ? "bg-accent" : ""}`}
								title="List"
								aria-pressed={view === "list"}
								onClick={() => setView("list")}
							>
								<ListIcon className="size-3" />
							</Button>
						</div>
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
										A signal lives in the app's worker. The page only knows the
										ones passed to a component, and gets a new value whenever
										the app changes one of them.
									</p>
									<p>
										Hover a use to outline it on the page; click it to open the
										component.
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
							placeholder="Filter by id, app or value..."
						/>
					</div>
					<select
						aria-label="App"
						className={`${FILTER_SELECT_CLASS} max-w-45`}
						value={app}
						onChange={(event) => setApp(event.target.value)}
					>
						<option value={ALL_APPS}>All apps</option>
						{apps.map((appId) => (
							<option key={appId} value={appId}>
								App {appId}
							</option>
						))}
					</select>
					<span className="ml-auto shrink-0 pr-1 text-xs text-muted-foreground">
						{rows.length} {rows.length === 1 ? "signal" : "signals"} ·{" "}
						{shown.records.length}{" "}
						{shown.records.length === 1 ? "sync" : "syncs"}
					</span>
				</div>

				{supported === false && rows.length > 0 && (
					<div className="flex gap-2 border-b border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-[11px] text-amber-700 dark:text-amber-300 shrink-0">
						<TriangleAlertIcon className="size-3.5 shrink-0 mt-0.5" />
						<span>
							The NubeSDK on this page does not report signal changes, so there
							is no history. Values are read from the page as it is now.
						</span>
					</div>
				)}

				{disconnected.map((appId) => (
					<div
						key={appId}
						className="flex gap-2 border-b border-red-500/40 bg-red-500/10 px-3 py-1.5 text-[11px] text-red-700 dark:text-red-300 shrink-0"
					>
						<TriangleAlertIcon className="size-3.5 shrink-0 mt-0.5" />
						<span>
							App {appId} renders signals but never called{" "}
							<code>useSignals(nube)</code>, so their changes do not reach the
							page. Call it once at the start of <code>App(nube)</code>.
						</span>
					</div>
				))}

				<div className="flex-1 overflow-hidden">
					<ResizablePanelGroup
						key={direction}
						autoSaveId={autoSaveId}
						storage={localStorage}
						direction={direction}
					>
						<ResizablePanel defaultSize={55}>
							{view === "list" ? (
								<SignalList
									rows={visibleRows}
									isLoading={isLoading}
									isEmpty={rows.length === 0}
									selectedId={selectedId}
									onSelect={setSelectedId}
								/>
							) : (
								<SignalGraphs
									rows={visibleRows}
									described={shown.graphs.map((graph) => graph.app)}
									truncated={shown.graphs
										.filter((graph) => graph.truncated)
										.map((graph) => graph.app)}
									selectedId={selectedId}
									onSelect={setSelectedId}
								/>
							)}
						</ResizablePanel>
						<ResizableHandle />
						<ResizablePanel>
							<SignalDetail
								row={selected}
								rows={rows}
								onSelect={setSelectedId}
								onOpenComponent={(key) => navigate(PAGES.COMPONENTS, key)}
							/>
						</ResizablePanel>
					</ResizablePanelGroup>
				</div>
			</div>
		</Layout>
	);
}

function SignalList({
	rows,
	isLoading,
	isEmpty,
	selectedId,
	onSelect,
}: {
	rows: SignalRow[];
	isLoading: boolean;
	isEmpty: boolean;
	selectedId: string | null;
	onSelect: (id: string) => void;
}) {
	if (rows.length === 0) {
		return (
			<div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
				{isLoading ? (
					<p className="text-xs text-muted-foreground">
						Reading the page's signals...
					</p>
				) : isEmpty ? (
					<>
						<p className="text-sm">No signals rendered</p>
						<p className="text-xs text-muted-foreground max-w-xs">
							Signals appear here once an app passes one to a component: as a
							child, or as the <code>when</code> of a <code>Show</code> or the{" "}
							<code>of</code> of a <code>Match.Value</code>.
						</p>
					</>
				) : (
					<p className="text-xs text-muted-foreground">
						No signal matches the filter.
					</p>
				)}
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col text-[12px]">
			<div
				className={`${GRID} h-6 shrink-0 border-b px-2 text-[10px] uppercase tracking-wide text-muted-foreground`}
			>
				<span />
				<span>Signal</span>
				<span>App</span>
				<span>Value</span>
				<span className="text-right">Uses</span>
				<span className="text-right">Changes</span>
				<span className="text-right">Last</span>
			</div>
			<ul className="flex-1 overflow-y-auto">
				{rows.map((row) => (
					<SignalListRow
						key={row.id}
						row={row}
						isSelected={row.id === selectedId}
						onSelect={onSelect}
					/>
				))}
			</ul>
		</div>
	);
}

function SignalListRow({
	row,
	isSelected,
	onSelect,
}: {
	row: SignalRow;
	isSelected: boolean;
	onSelect: (id: string) => void;
}) {
	// The last change, not the value: a signal set back and forth to the same
	// two values still flashes.
	const isHighlighted = useChangeHighlight(String(row.changes.at(-1)?.seq));
	const status = STATUS[row.status];

	return (
		<li>
			<button
				type="button"
				className={`${GRID} h-6 w-full px-2 text-left font-mono transition-colors duration-1000 ${
					isSelected
						? "bg-accent"
						: isHighlighted
							? "bg-amber-500/25 duration-0"
							: "hover:bg-accent/50"
				}`}
				onClick={() => onSelect(row.id)}
				onMouseEnter={() =>
					void highlightPageComponents(
						row.bindings.flatMap((binding) => binding.domIds),
						row.id,
					)
				}
				onMouseLeave={() => void highlightPageComponents([])}
			>
				<span
					className={`size-2 rounded-full ${status.dot}`}
					title={`${status.label}: ${status.description}`}
				/>
				<span className="flex min-w-0 items-center gap-1.5" title={row.id}>
					<SignalId id={row.id} kind={row.kind} />
					{row.kind === "computed" && (
						<span className="shrink-0 font-sans text-[10px] text-muted-foreground">
							computed
						</span>
					)}
					{row.problems.length > 0 && (
						<TriangleAlertIcon
							className="size-3 shrink-0 text-red-600 dark:text-red-400"
							aria-label="The page is not following this signal"
						/>
					)}
				</span>
				<span className="truncate text-muted-foreground">{row.app}</span>
				<span
					className={`truncate ${
						row.status === "rejected"
							? "font-sans italic text-red-700 dark:text-red-300"
							: row.status === "internal"
								? "font-sans italic text-muted-foreground"
								: "text-emerald-700 dark:text-emerald-300"
					}`}
				>
					{row.status === "rejected"
						? "refused: belongs to another app"
						: row.status === "internal"
							? "worker only"
							: formatValue(row.value, 120)}
				</span>
				<span className="text-right text-muted-foreground">
					{row.bindings.length}
				</span>
				<span className="text-right text-muted-foreground">
					{row.changes.length}
				</span>
				<span className="text-right font-sans text-[11px] text-muted-foreground">
					{row.lastChange > 0 ? (
						<RelativeTime timestamp={row.lastChange} />
					) : (
						"—"
					)}
				</span>
			</button>
		</li>
	);
}

function Section({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<div className="space-y-1">
			<span className="text-[10px] uppercase tracking-wide text-muted-foreground">
				{title}
			</span>
			{children}
		</div>
	);
}

/**
 * Scrolls the page to the first place of `bindings` that is on it right now
 * and outlines it. Places in a branch that is not mounted are tried last:
 * they have nothing on the page unless the branch came back meanwhile.
 */
async function locate(bindings: SignalBinding[], title: string) {
	const ordered = [
		...bindings.filter((binding) => !binding.inactive),
		...bindings.filter((binding) => binding.inactive),
	];
	for (const binding of ordered) {
		if (binding.domIds.length === 0) continue;
		if (await scrollToPageComponent(binding.domIds)) {
			void highlightPageComponents(binding.domIds, title);
			return;
		}
	}
	toast.error("It is not rendered on the page right now");
}

/** A link to another signal of the list. */
function SignalLink({
	id,
	rows,
	onSelect,
}: {
	id: string;
	rows: SignalRow[];
	onSelect: (id: string) => void;
}) {
	const target = rows.find((row) => row.id === id);

	return (
		<button
			type="button"
			className="flex w-full items-center gap-1.5 px-2 py-1 text-left text-[11px] font-mono hover:bg-accent/50"
			onClick={() => onSelect(id)}
		>
			<SignalId id={id} kind={target?.kind} />
			{target &&
				target.status !== "internal" &&
				target.status !== "rejected" && (
					<span className="truncate text-emerald-700 dark:text-emerald-300">
						{formatValue(target.value, 60)}
					</span>
				)}
			{target?.status === "internal" && (
				<span className="shrink-0 rounded bg-slate-500/20 px-1 font-sans text-[10px] text-slate-700 dark:text-slate-300">
					worker only
				</span>
			)}
			{target?.kind === "computed" && (
				<span className="shrink-0 font-sans text-[10px] text-muted-foreground">
					computed
				</span>
			)}
		</button>
	);
}

const LEGEND: {
	label: string;
	box: string;
	title: string;
	kind?: keyof typeof KIND_ICON;
}[] = [
	{
		label: "signal",
		kind: "signal",
		box: "border-amber-500/60 bg-amber-500/10",
		title: "A value the app writes",
	},
	{
		label: "computed",
		kind: "computed",
		box: "border-violet-500/60 bg-violet-500/10",
		title: "Derived from other signals",
	},
	{
		label: "effect",
		kind: "effect",
		box: "border-rose-500/60 bg-rose-500/10",
		title: "Code of the app that runs when a signal changes",
	},
	{
		label: "component",
		kind: "use",
		box: "border-sky-500/60 bg-sky-500/10",
		title: "A component on the page bound to the signal",
	},
	{
		label: "worker only",
		box: "border-dashed border-slate-500/70 bg-slate-500/20",
		title:
			"Grey and dashed: the app never passed it to a component, so it only exists in the app's worker and the page has no value for it",
	},
	{
		label: "stale on the page",
		box: "border-red-500 bg-red-500/10",
		title:
			"The app changed this signal but the page still shows an older value: the app never called useSignals(nube), or the new value cannot be turned into JSON. The side panel says which",
	},
];

/** What the colors, icons and borders of the graph mean. */
function GraphLegend() {
	return (
		<span className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-muted-foreground">
			{LEGEND.map((item) => {
				const Icon = item.kind ? KIND_ICON[item.kind] : null;
				return (
					<span
						key={item.label}
						className="flex items-center gap-1"
						title={item.title}
					>
						<span
							className={`inline-flex h-3.5 w-5 items-center justify-center rounded-sm border ${item.box}`}
						>
							{Icon && item.kind && (
								<Icon className={`size-2.5 ${KIND_ICON_CLASS[item.kind]}`} />
							)}
						</span>
						{item.label}
					</span>
				);
			})}
		</span>
	);
}

/** One graph per app: signals never depend on signals of another app. */
function SignalGraphs({
	rows,
	described,
	truncated,
	selectedId,
	onSelect,
}: {
	rows: SignalRow[];
	/** Apps that described their graph. */
	described: string[];
	/** Apps whose graph did not fit a message. */
	truncated: string[];
	selectedId: string | null;
	onSelect: (id: string) => void;
}) {
	const byApp = useMemo(() => {
		const groups = new Map<string, SignalRow[]>();
		for (const row of rows) {
			// A refused signal is listed under the app that sent it, but it is
			// not part of that app's graph.
			if (row.status === "rejected") continue;
			const group = groups.get(row.app);
			if (group) group.push(row);
			else groups.set(row.app, [row]);
		}
		return [...groups].map(
			([app, group]) => [app, layoutSignalGraph(group)] as const,
		);
	}, [rows]);

	if (byApp.length === 0) {
		return (
			<div className="flex h-full items-center justify-center px-4 text-center">
				<p className="text-xs text-muted-foreground">No signals to draw.</p>
			</div>
		);
	}

	return (
		<div className="h-full overflow-auto">
			{byApp.map(([app, layout]) => (
				<section key={app} className="border-b last:border-b-0">
					<header className="sticky left-0 flex flex-wrap items-center gap-x-2 px-3 pt-2 text-[11px]">
						<span className="font-medium">App {app}</span>
						<GraphLegend />
					</header>
					{!described.includes(app) && (
						<p className="sticky left-0 px-3 pt-1 text-[11px] text-muted-foreground">
							This app did not describe its signals (its signals package or the
							SDK on this page predates it), so only the signals on the page are
							drawn, without names, computed sources or effects.
						</p>
					)}
					{truncated.includes(app) && (
						<p className="sticky left-0 px-3 pt-1 text-[11px] text-amber-700 dark:text-amber-300">
							This app has more signals or effects than the graph carries; the
							rest is not drawn.
						</p>
					)}
					<SignalGraphView
						layout={layout}
						selectedId={selectedId}
						onSelect={onSelect}
					/>
				</section>
			))}
		</div>
	);
}

function SignalDetail({
	row,
	rows,
	onSelect,
	onOpenComponent,
}: {
	row: SignalRow | null;
	rows: SignalRow[];
	onSelect: (id: string) => void;
	onOpenComponent: (nodeKey: string) => void;
}) {
	if (!row) {
		return (
			<div className="flex h-full items-center justify-center px-4 text-center">
				<p className="text-xs text-muted-foreground max-w-xs">
					Select a signal to see its value, where the page uses it and how it
					changed.
				</p>
			</div>
		);
	}

	const status = STATUS[row.status];
	const history = row.changes.slice(-HISTORY_LIMIT).reverse();

	return (
		<div className="flex h-full flex-col">
			<div className="flex items-center justify-between gap-2 px-3 py-1.5 border-b shrink-0">
				<div className="min-w-0">
					<span className="text-[10px] uppercase tracking-wide text-muted-foreground">
						{row.kind === "computed" ? "Computed signal" : "Signal"} · app{" "}
						{row.app}
					</span>
					<div className="flex items-baseline gap-2 text-xs font-medium">
						<SignalId id={row.id} kind={row.kind} />
						<span
							className="truncate font-mono text-[10px] font-normal text-muted-foreground"
							title={row.id}
						>
							{row.id}
						</span>
					</div>
				</div>
				<div className="flex items-center gap-1 shrink-0">
					<Button
						variant="ghost"
						size="icon"
						className="h-6 w-6"
						disabled={row.bindings.length === 0}
						title={
							row.bindings.length === 0
								? row.status === "internal"
									? "Worker only: this signal is not on the page"
									: "No slot uses this signal right now"
								: "Scroll the page to where this signal is used"
						}
						onClick={() => void locate(row.bindings, row.id)}
					>
						<LocateFixedIcon className="size-3" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="h-6 w-6 shrink-0"
						title="Copy the signal id"
						onClick={() =>
							copyToClipboard(
								row.id,
								() => toast.success("Id copied to clipboard"),
								(error) => toast.error(error),
							)
						}
					>
						<CopyIcon className="size-3" />
					</Button>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto p-3 space-y-3">
				{row.status === "internal" ? (
					<div className="rounded border-2 border-dashed border-slate-500/70 bg-slate-500/15 px-3 py-2">
						<div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
							<CpuIcon className="size-3.5" />
							Worker only
						</div>
						<p className="mt-1 text-[11px] text-slate-700 dark:text-slate-300">
							This signal only exists in the app's worker. The app never passed
							it to a component, so it is not on the page: there is no value, no
							history and nowhere to scroll to. It shows up here because other
							signals or effects of the app read it.
						</p>
					</div>
				) : (
					<div
						className={`flex gap-2 rounded border px-2 py-1.5 text-[11px] ${
							row.status === "rejected"
								? "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300"
								: "text-muted-foreground"
						}`}
					>
						<span
							className={`mt-1 size-2 shrink-0 rounded-full ${status.dot}`}
						/>
						<span>
							<strong className="font-medium">{status.label}</strong> ·{" "}
							{status.description}
						</span>
					</div>
				)}

				{row.problems.map((problem) => (
					<div
						key={problem}
						className="flex gap-2 rounded border border-red-500/40 bg-red-500/10 px-2 py-1.5 text-[11px] text-red-700 dark:text-red-300"
					>
						<TriangleAlertIcon className="size-3.5 shrink-0 mt-0.5" />
						<span>{PROBLEM[problem]}</span>
					</div>
				))}

				{row.status !== "rejected" && row.status !== "internal" && (
					<Section title="Value">
						<div className="rounded border px-2 py-1.5 text-xs">
							<JsonViewer
								data={
									row.bindings.length > 0
										? { value: row.value, initialValue: row.initialValue }
										: { value: row.value }
								}
								name={false}
								collapsed={2}
							/>
						</div>
					</Section>
				)}

				{row.deps.length > 0 && (
					<Section title={`Derived from (${row.deps.length})`}>
						<ul className="rounded border divide-y">
							{row.deps.map((id) => (
								<li key={id}>
									<SignalLink id={id} rows={rows} onSelect={onSelect} />
								</li>
							))}
						</ul>
					</Section>
				)}

				{row.dependents.length + row.effects.length > 0 && (
					<Section
						title={`Read in the app by (${row.dependents.length + row.effects.length})`}
					>
						<ul className="rounded border divide-y">
							{row.dependents.map((id) => (
								<li key={id}>
									<SignalLink id={id} rows={rows} onSelect={onSelect} />
								</li>
							))}
							{row.effects.map((effect) => (
								<li
									key={effect.id}
									className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-mono"
								>
									<span
										className="inline-flex items-center gap-0.5"
										title={`Effect ${effect.id}`}
									>
										<KIND_ICON.effect
											className={`size-3 ${KIND_ICON_CLASS.effect}`}
										/>
										{shortSignalId(effect.id)}
									</span>
									<span className="font-sans text-[10px] text-muted-foreground">
										effect
									</span>
								</li>
							))}
						</ul>
					</Section>
				)}

				<Section title={`Used on the page (${row.bindings.length})`}>
					{row.bindings.length === 0 ? (
						<p className="text-[11px] text-muted-foreground">
							No slot uses this signal right now.
						</p>
					) : (
						<ul
							className="rounded border divide-y"
							onMouseLeave={() => void highlightPageComponents([])}
						>
							{row.bindings.map((binding) => (
								<BindingRow
									key={`${binding.nodeKey}:${binding.role}:${binding.prop ?? ""}`}
									binding={binding}
									onOpen={onOpenComponent}
								/>
							))}
						</ul>
					)}
				</Section>

				{row.status !== "rejected" && row.status !== "internal" && (
					<Section
						title={
							row.changes.length > HISTORY_LIMIT
								? `History (last ${HISTORY_LIMIT} of ${row.changes.length})`
								: `History (${row.changes.length})`
						}
					>
						{history.length === 0 ? (
							<p className="text-[11px] text-muted-foreground">
								No change since the page loaded (or since the history was
								cleared).
							</p>
						) : (
							<ul className="rounded border divide-y">
								{history.map((change) => (
									<HistoryRow key={change.seq} change={change} />
								))}
							</ul>
						)}
					</Section>
				)}
			</div>
		</div>
	);
}

function BindingRow({
	binding,
	onOpen,
}: {
	binding: SignalBinding;
	onOpen: (nodeKey: string) => void;
}) {
	return (
		<li className={`flex items-center ${binding.inactive ? "opacity-50" : ""}`}>
			<button
				type="button"
				className="flex min-w-0 flex-1 flex-wrap items-center gap-x-1.5 gap-y-0.5 px-2 py-1 text-left text-[11px] hover:bg-accent/50"
				title="Open in the Components page"
				onClick={() => onOpen(binding.nodeKey)}
				onMouseEnter={() =>
					void highlightPageComponents(binding.domIds, binding.component)
				}
			>
				<span className="text-muted-foreground">
					{binding.role === "prop"
						? `${binding.prop} of`
						: ROLE_LABEL[binding.role]}
				</span>
				<span className="font-mono text-sky-700 dark:text-sky-300">
					{binding.component}
				</span>
				<span className="font-mono text-muted-foreground">
					in {binding.slot}
					{binding.entryKey !== undefined ? `[${binding.entryKey}]` : ""}
				</span>
				{binding.active !== undefined && (
					<Badge
						variant="outline"
						className={`text-[10px] px-1 py-0 ${
							binding.active === null
								? ""
								: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
						}`}
					>
						{binding.active === null
							? "mounts nothing"
							: `mounts ${binding.active}`}
					</Badge>
				)}
				{binding.inactive && (
					<span className="text-[10px] text-muted-foreground">
						in a branch that is not mounted
					</span>
				)}
			</button>
			<Button
				variant="ghost"
				size="icon"
				className="mr-1 h-6 w-6 shrink-0"
				title="Scroll the page to it"
				onClick={() => void locate([binding], binding.component)}
			>
				<LocateFixedIcon className="size-3" />
			</Button>
		</li>
	);
}

function HistoryRow({ change }: { change: SignalChange }) {
	const modifiedPaths = useMemo(
		() =>
			change.hadPrev
				? getModifiedPaths({ value: change.prev }, { value: change.value })
				: undefined,
		[change],
	);
	const isObject = typeof change.value === "object" && change.value !== null;

	return (
		<li className="px-2 py-1 text-[11px]">
			<div className="flex items-center gap-2">
				<span className="shrink-0 font-mono text-muted-foreground">
					#{change.seq}
				</span>
				{isObject ? (
					<span className="flex-1" />
				) : (
					<span className="flex-1 min-w-0 truncate font-mono">
						{change.hadPrev && (
							<span className="text-muted-foreground">
								{formatValue(change.prev, 40)} →{" "}
							</span>
						)}
						<span className="text-emerald-700 dark:text-emerald-300">
							{formatValue(change.value, 80)}
						</span>
					</span>
				)}
				{change.batchSize > 1 && (
					<span
						className="shrink-0 text-[10px] text-muted-foreground"
						title="Signals changed in the same message (a batch in the app)"
					>
						batch of {change.batchSize}
					</span>
				)}
				<RelativeTime
					timestamp={change.timestamp}
					className="shrink-0 text-muted-foreground"
				/>
			</div>
			{isObject && (
				<div className="mt-1 text-xs">
					<JsonViewer
						data={{ value: change.value }}
						name={false}
						collapsed={1}
						modifiedPaths={modifiedPaths}
					/>
				</div>
			)}
		</li>
	);
}
