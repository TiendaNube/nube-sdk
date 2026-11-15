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
import { ConditionSteps } from "@/devtools/components/condition-steps";
import { JsonViewer } from "@/devtools/components/json-viewer";
import Layout from "@/devtools/components/layout";
import { PanelDirectionToggle } from "@/devtools/components/panel-direction-toggle";
import { SearchInput } from "@/devtools/components/search-input";
import { UpdatedAt } from "@/devtools/components/updated-at";
import { useComponentsSnapshot } from "@/devtools/hooks";
import { usePanelDirection } from "@/hooks/use-panel-direction";
import {
	type ComponentNode,
	PAGE_VIEW,
	type SignalState,
	ancestorKeys,
	buildComponentTree,
	countComponents,
	domIdsOf,
	filterTree,
	findNode,
	nodeForDomIds,
} from "@/utils/component-tree";
import { formatValue } from "@/utils/conditions";
import { copyToClipboard } from "@/utils/file-utils";
import {
	highlightPageComponents,
	inspectPageComponent,
	readInspectedElementIds,
	scrollToPageComponent,
} from "@/utils/page-components";
import {
	ChevronDownIcon,
	ChevronRightIcon,
	ComponentIcon,
	CopyIcon,
	InfoIcon,
	LocateFixedIcon,
	RefreshCwIcon,
	ScanSearchIcon,
	TriangleAlertIcon,
	ZapIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

const PANEL_WIDTH_KEY = "nube-devtools-components-page-width";

const FILTER_SELECT_CLASS =
	"h-5 shrink-0 rounded border bg-transparent px-1.5 text-[12px] outline-none";

type Row = { node: ComponentNode; depth: number };

/** The visible rows, in tree order. A search shows every match expanded. */
function flattenRows(
	nodes: ComponentNode[],
	collapsed: Set<string>,
	ignoreCollapsed: boolean,
	depth = 0,
	rows: Row[] = [],
): Row[] {
	for (const node of nodes) {
		rows.push({ node, depth });
		if (ignoreCollapsed || !collapsed.has(node.key)) {
			flattenRows(node.children, collapsed, ignoreCollapsed, depth + 1, rows);
		}
	}
	return rows;
}

export function Components() {
	const { direction, toggleDirection, autoSaveId } =
		usePanelDirection(PANEL_WIDTH_KEY);
	// Every dispatch may have re-rendered a slot, and every signal change may
	// have swapped a branch, so the tree follows both streams instead of
	// waiting for a manual refresh.
	const { snapshot, isLoading, updatedAt, refresh } = useComponentsSnapshot();
	const { focus, clearFocus, navigate } = useNavigation();

	const [view, setView] = useState<string>(PAGE_VIEW);
	const [search, setSearch] = useState("");
	const [selectedKey, setSelectedKey] = useState<string | null>(null);
	const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());

	// Never leave an outline on the page once the panel moves elsewhere.
	useEffect(() => () => void highlightPageComponents([]), []);

	const apps = useMemo(
		() => (snapshot ? Object.keys(snapshot.apps).sort() : []),
		[snapshot],
	);

	// The app being viewed stopped rendering (or the page reloaded).
	useEffect(() => {
		if (view !== PAGE_VIEW && snapshot && !apps.includes(view)) {
			setView(PAGE_VIEW);
		}
	}, [apps, snapshot, view]);

	const tree = useMemo(
		() => (snapshot ? buildComponentTree(snapshot, view) : []),
		[snapshot, view],
	);
	const visibleTree = useMemo(() => filterTree(tree, search), [tree, search]);
	const rows = useMemo(
		() => flattenRows(visibleTree, collapsed, search.trim() !== ""),
		[visibleTree, collapsed, search],
	);
	const selectedNode = useMemo(
		() => (selectedKey ? findNode(tree, selectedKey) : null),
		[tree, selectedKey],
	);

	const listRef = useRef<HTMLUListElement>(null);
	const treeRef = useRef(tree);
	useEffect(() => {
		treeRef.current = tree;
	}, [tree]);

	/** Selects `key`, expanding what hides it and bringing its row into view. */
	const reveal = useCallback((key: string) => {
		const ancestors = ancestorKeys(treeRef.current, key) ?? [];
		setCollapsed((current) => {
			if (!ancestors.some((ancestor) => current.has(ancestor))) return current;
			const next = new Set(current);
			for (const ancestor of ancestors) next.delete(ancestor);
			return next;
		});
		setSelectedKey(key);
		requestAnimationFrame(() => {
			listRef.current
				?.querySelector(`[data-node-key="${CSS.escape(key)}"]`)
				?.scrollIntoView({ block: "nearest" });
		});
	}, []);

	// Another page (Signals) asked for a node of the page view.
	useEffect(() => {
		if (focus?.page !== PAGES.COMPONENTS) return;
		if (view !== PAGE_VIEW) {
			setView(PAGE_VIEW);
			return;
		}
		if (!findNode(tree, focus.target)) {
			// Still loading; a tree without the node will never have it.
			if (snapshot) clearFocus();
			return;
		}
		setSearch("");
		reveal(focus.target);
		clearFocus();
	}, [focus, view, tree, snapshot, reveal, clearFocus]);

	const openSignal = useCallback(
		(id: string) => navigate(PAGES.SIGNALS, id),
		[navigate],
	);

	// Selecting an element in the Elements panel selects the component that
	// rendered it, the way framework devtools sync with the inspector.
	useEffect(() => {
		const onSelectionChanged = async () => {
			const ids = await readInspectedElementIds();
			const node = nodeForDomIds(treeRef.current, ids);
			if (node) reveal(node.key);
		};

		const elements = chrome.devtools?.panels?.elements;
		elements?.onSelectionChanged.addListener(onSelectionChanged);
		return () =>
			elements?.onSelectionChanged.removeListener(onSelectionChanged);
	}, [reveal]);

	const toggle = (key: string) => {
		setCollapsed((current) => {
			const next = new Set(current);
			if (next.has(key)) next.delete(key);
			else next.add(key);
			return next;
		});
	};

	const componentCount = countComponents(tree);

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
							title="Refresh the components"
							onClick={async () => {
								if (await refresh()) toast.success("Components refreshed");
								else toast.error("Could not read the page's components");
							}}
						>
							<RefreshCwIcon className="size-3" />
						</Button>
						<Divider />
						<ComponentIcon className="size-3 shrink-0" />
						<span className="ml-1.5 text-xs font-medium">Components</span>
						<span className="ml-2 text-xs text-muted-foreground truncate hidden sm:inline">
							The component tree your apps render into the slots
						</span>
					</div>
					<div className="flex items-center gap-1.5 shrink-0 pr-1">
						<UpdatedAt timestamp={updatedAt} />
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
										<strong>Page</strong> shows what the slots render, with
										every app merged; pick an app to see only what it sent.
									</p>
									<p>
										Hover a node to outline it on the page. Select an element in
										the Elements panel to find the component that rendered it.
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
							placeholder="Filter by component, slot, app or id..."
						/>
					</div>
					<select
						aria-label="View"
						className={`${FILTER_SELECT_CLASS} max-w-45`}
						value={view}
						onChange={(event) => {
							setView(event.target.value);
							setSelectedKey(null);
						}}
					>
						<option value={PAGE_VIEW}>Page (all apps)</option>
						{apps.map((appId) => (
							<option key={appId} value={appId}>
								App {appId}
							</option>
						))}
					</select>
					<span className="ml-auto shrink-0 pr-1 text-xs text-muted-foreground">
						{tree.length} {tree.length === 1 ? "slot" : "slots"} ·{" "}
						{componentCount} {componentCount === 1 ? "component" : "components"}
					</span>
				</div>

				<div className="flex-1 overflow-hidden">
					<ResizablePanelGroup
						key={direction}
						autoSaveId={autoSaveId}
						storage={localStorage}
						direction={direction}
					>
						<ResizablePanel defaultSize={55}>
							<ComponentList
								listRef={listRef}
								rows={rows}
								isLoading={isLoading}
								isEmpty={tree.length === 0}
								isPageView={view === PAGE_VIEW}
								collapsed={collapsed}
								selectedKey={selectedKey}
								onSelect={setSelectedKey}
								onToggle={toggle}
							/>
						</ResizablePanel>
						<ResizableHandle />
						<ResizablePanel>
							<ComponentDetail
								node={selectedNode}
								values={snapshot?.values ?? {}}
								onOpenSignal={openSignal}
							/>
						</ResizablePanel>
					</ResizablePanelGroup>
				</div>
			</div>
		</Layout>
	);
}

type ComponentListProps = {
	listRef: React.RefObject<HTMLUListElement>;
	rows: Row[];
	isLoading: boolean;
	isEmpty: boolean;
	isPageView: boolean;
	collapsed: Set<string>;
	selectedKey: string | null;
	onSelect: (key: string) => void;
	onToggle: (key: string) => void;
};

function ComponentList({
	listRef,
	rows,
	isLoading,
	isEmpty,
	isPageView,
	collapsed,
	selectedKey,
	onSelect,
	onToggle,
}: ComponentListProps) {
	if (rows.length === 0) {
		return (
			<div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
				{isLoading ? (
					<p className="text-xs text-muted-foreground">
						Reading the page's components...
					</p>
				) : isEmpty ? (
					<>
						<p className="text-sm">No components rendered</p>
						<p className="text-xs text-muted-foreground max-w-xs">
							Components appear as your apps call <code>render</code> on a slot.
						</p>
					</>
				) : (
					<p className="text-xs text-muted-foreground">
						No component matches the filter.
					</p>
				)}
			</div>
		);
	}

	return (
		<ul
			ref={listRef}
			className="h-full overflow-y-auto py-0.5"
			onMouseLeave={() => void highlightPageComponents([])}
		>
			{rows.map(({ node, depth }) => (
				<ComponentRow
					key={node.key}
					node={node}
					depth={depth}
					isPageView={isPageView}
					isCollapsed={collapsed.has(node.key)}
					isSelected={node.key === selectedKey}
					onSelect={onSelect}
					onToggle={onToggle}
				/>
			))}
		</ul>
	);
}

type ComponentRowProps = {
	node: ComponentNode;
	depth: number;
	isPageView: boolean;
	isCollapsed: boolean;
	isSelected: boolean;
	onSelect: (key: string) => void;
	onToggle: (key: string) => void;
};

function ComponentRow({
	node,
	depth,
	isPageView,
	isCollapsed,
	isSelected,
	onSelect,
	onToggle,
}: ComponentRowProps) {
	const isSlot = node.kind === "slot";
	const hasChildren = node.children.length > 0;

	const label =
		node.kind === "text" ? (
			<span className="truncate italic text-muted-foreground">
				"{node.name}"
			</span>
		) : node.kind === "signal" ? (
			<span className="flex min-w-0 items-center gap-1">
				<span className="truncate text-emerald-700 dark:text-emerald-300">
					{node.name}
				</span>
				<SignalTag id={node.signal?.id ?? ""} />
			</span>
		) : node.kind === "branch" ? (
			<span className="truncate italic text-muted-foreground">{node.name}</span>
		) : (
			<span
				className={`truncate ${
					isSlot ? "font-semibold" : "text-sky-700 dark:text-sky-300"
				}`}
			>
				{node.name}
			</span>
		);

	return (
		<li
			data-node-key={node.key}
			className={`flex items-center h-6 pr-2 text-[12px] font-mono ${
				node.inactive || node.branch?.active === false ? "opacity-50 " : ""
			}${
				isSelected
					? "bg-accent"
					: isSlot
						? "hover:bg-[rgba(124,219,110,0.15)]"
						: "hover:bg-[rgba(111,168,220,0.15)]"
			}`}
			style={{ paddingLeft: `${depth * 12 + 4}px` }}
			onMouseEnter={() =>
				void highlightPageComponents(
					domIdsOf(node),
					node.name,
					isSlot ? "green" : "blue",
				)
			}
		>
			{hasChildren ? (
				<button
					type="button"
					aria-label={isCollapsed ? "Expand" : "Collapse"}
					className="shrink-0 text-muted-foreground cursor-pointer"
					onClick={() => onToggle(node.key)}
				>
					{isCollapsed ? (
						<ChevronRightIcon className="size-3.5" />
					) : (
						<ChevronDownIcon className="size-3.5" />
					)}
				</button>
			) : (
				<span className="w-3.5 shrink-0" />
			)}
			<button
				type="button"
				className="flex flex-1 min-w-0 items-center gap-1.5 h-full pl-1 text-left"
				onClick={() => onSelect(node.key)}
			>
				{label}
				{node.entryKey !== undefined && (
					<span className="shrink-0 text-muted-foreground">
						[{node.entryKey}]
					</span>
				)}
				{node.componentKey !== undefined && (
					<span className="shrink-0 text-muted-foreground">
						key="{node.componentKey}"
					</span>
				)}
				{isPageView && node.kind === "component" && node.app && (
					<span className="shrink-0 text-[11px] text-muted-foreground">
						app {node.app}
					</span>
				)}
				{node.controlFlow && <ControlFlowSummary node={node} />}
				{node.branch && <BranchBadge node={node} />}
				{node.signalProps?.map((signal) => (
					<span
						key={signal.prop}
						className="flex shrink-0 items-center gap-1 text-muted-foreground"
					>
						{signal.prop}=
						<span className="text-emerald-700 dark:text-emerald-300">
							{formatValue(signal.value, 24)}
						</span>
						<SignalTag id={signal.id} />
					</span>
				))}
				{isSlot && <SlotBadges node={node} />}
			</button>
		</li>
	);
}

/** The short name of a signal: what comes after `signal-<appId>-`. */
function SignalTag({ id }: { id: string }) {
	return (
		<span
			className="inline-flex shrink-0 items-center gap-0.5 rounded bg-amber-500/10 px-1 text-[10px] text-amber-700 dark:text-amber-300"
			title={`Live value of ${id}`}
		>
			<ZapIcon className="size-2.5" />
			{id.slice(id.lastIndexOf("-") + 1)}
		</span>
	);
}

/** `Show` and `Match.Value`: the signal they follow and its value. */
function ControlFlowSummary({ node }: { node: ComponentNode }) {
	const signal = node.controlFlow?.signal;
	const prop = node.controlFlow?.kind === "show" ? "when" : "of";

	if (!signal) {
		return (
			<Badge
				variant="outline"
				className="shrink-0 font-sans text-[10px] px-1 py-0 border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300"
				title={`\`${prop}\` is not a signal of the app, so nothing is rendered`}
			>
				{prop} is not a signal
			</Badge>
		);
	}

	return (
		<span className="flex min-w-0 shrink items-center gap-1 text-muted-foreground">
			{prop}=
			<span className="truncate text-emerald-700 dark:text-emerald-300">
				{formatValue(signal.value, 24)}
			</span>
			<SignalTag id={signal.id} />
		</span>
	);
}

/** A branch of a `Show` or of a `Match.Value`: its condition and state. */
function BranchBadge({ node }: { node: ComponentNode }) {
	const outcome = node.branch?.outcome;

	return (
		<span className="flex min-w-0 shrink items-center gap-1.5">
			{outcome && (
				<span
					className={`truncate ${
						outcome.valid
							? "text-muted-foreground"
							: "text-red-700 dark:text-red-300"
					}`}
				>
					{outcome.text}
				</span>
			)}
			{outcome && !outcome.valid ? (
				<Badge
					variant="outline"
					className="shrink-0 font-sans text-[10px] px-1 py-0 border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300"
					title="The platform cannot read this condition, so it never matches"
				>
					invalid
				</Badge>
			) : node.branch?.active ? (
				<Badge
					variant="outline"
					className="shrink-0 font-sans text-[10px] px-1 py-0 border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
				>
					mounted
				</Badge>
			) : (
				<span className="shrink-0 font-sans text-[10px] text-muted-foreground">
					not mounted
				</span>
			)}
		</span>
	);
}

/** A signal in the detail pane: its value and the way to the Signals page. */
function SignalDetail({
	label,
	signal,
	onOpenSignal,
}: {
	label: string;
	signal: SignalState;
	onOpenSignal: (id: string) => void;
}) {
	return (
		<div className="space-y-1">
			<div className="flex items-center justify-between gap-2">
				<span className="text-[10px] uppercase tracking-wide text-muted-foreground">
					{label}
				</span>
				<button
					type="button"
					className="flex items-center gap-1 text-[11px] font-mono text-amber-700 hover:underline dark:text-amber-300"
					title="Open in the Signals page"
					onClick={() => onOpenSignal(signal.id)}
				>
					<ZapIcon className="size-3" />
					{signal.id}
				</button>
			</div>
			<div className="rounded border px-2 py-1.5 text-xs">
				<JsonViewer
					data={
						signal.synced
							? { value: signal.value, initialValue: signal.initialValue }
							: { value: signal.value }
					}
					name={false}
					collapsed={2}
				/>
			</div>
			{!signal.synced && (
				<p className="text-[11px] text-muted-foreground">
					Still the value it was rendered with: the app has not changed it
					since.
				</p>
			)}
		</div>
	);
}

function SlotBadges({ node }: { node: ComponentNode }) {
	const appCount = node.apps?.length ?? 0;

	return (
		<span className="flex items-center gap-1 shrink-0 font-sans">
			{node.mounted === 0 ? (
				<Badge
					variant="outline"
					className="text-[10px] px-1 py-0 border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
					title="The page renders no host for this slot"
				>
					not mounted
				</Badge>
			) : (
				(node.mounted ?? 0) > 1 && (
					<Badge variant="outline" className="text-[10px] px-1 py-0">
						{node.mounted} hosts
					</Badge>
				)
			)}
			{node.repeatable && (
				<Badge variant="outline" className="text-[10px] px-1 py-0">
					repeatable
				</Badge>
			)}
			{appCount > 1 && (
				<Badge variant="outline" className="text-[10px] px-1 py-0">
					{appCount} apps
				</Badge>
			)}
		</span>
	);
}

function DetailRow({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<>
			<span className="text-muted-foreground">{label}</span>
			<span className="break-all">{children}</span>
		</>
	);
}

function ComponentDetail({
	node,
	values,
	onOpenSignal,
}: {
	node: ComponentNode | null;
	values: Record<string, unknown>;
	onOpenSignal: (id: string) => void;
}) {
	if (!node) {
		return (
			<div className="flex h-full items-center justify-center px-4 text-center">
				<p className="text-xs text-muted-foreground max-w-xs">
					Select a component to inspect it, or select an element in the Elements
					panel to find the component that rendered it.
				</p>
			</div>
		);
	}

	const isSlot = node.kind === "slot";
	const hasValue = node.id !== undefined && node.id in values;
	const hasProps = Object.keys(node.props).length > 0;

	const handleScroll = async () => {
		const found = await scrollToPageComponent(domIdsOf(node));
		if (!found) toast.error("It is not rendered on the page right now");
	};

	const handleInspect = async () => {
		const found = await inspectPageComponent(domIdsOf(node));
		if (!found) toast.error("It is not rendered on the page right now");
	};

	return (
		<div className="flex h-full flex-col">
			<div className="flex items-center justify-between gap-2 px-3 py-1.5 border-b shrink-0">
				<div className="min-w-0">
					<span className="text-[10px] uppercase tracking-wide text-muted-foreground">
						{isSlot
							? "Slot"
							: node.kind === "text"
								? "Text"
								: node.kind === "signal"
									? "Signal (text)"
									: node.kind === "branch"
										? "Branch"
										: "Component"}
					</span>
					<div
						className="truncate text-xs font-medium font-mono"
						title={node.name}
					>
						{node.name}
					</div>
				</div>
				<div className="flex items-center gap-1 shrink-0">
					{node.id && (
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6"
							title="Copy the DOM id"
							onClick={() =>
								copyToClipboard(
									node.id as string,
									() => toast.success("Id copied to clipboard"),
									(error) => toast.error(error),
								)
							}
						>
							<CopyIcon className="size-3" />
						</Button>
					)}
					{(isSlot || node.kind === "component") && (
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6"
							title="Scroll the page to it"
							onClick={handleScroll}
						>
							<LocateFixedIcon className="size-3" />
						</Button>
					)}
					{(isSlot || node.kind === "component") && (
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6"
							title="Inspect in the Elements panel"
							onClick={handleInspect}
						>
							<ScanSearchIcon className="size-3" />
						</Button>
					)}
				</div>
			</div>

			<div className="flex-1 overflow-y-auto p-3 space-y-3">
				{isSlot && node.mounted === 0 && (
					<div className="flex gap-2 rounded border border-amber-500/40 bg-amber-500/10 px-2 py-1.5 text-[11px] text-amber-700 dark:text-amber-300">
						<TriangleAlertIcon className="size-3.5 shrink-0 mt-0.5" />
						<span>
							The page renders no host for this slot, so nothing sent to it is
							visible. The theme may not support it, or it may only exist on
							other pages.
						</span>
					</div>
				)}

				<div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-[11px]">
					{node.type && (
						<DetailRow label="Type">
							<span className="font-mono">{node.type}</span>
						</DetailRow>
					)}
					{node.app && <DetailRow label="App">{node.app}</DetailRow>}
					{!isSlot && (
						<DetailRow label="Slot">
							<span className="font-mono">{node.slot}</span>
						</DetailRow>
					)}
					{node.entryKey !== undefined && (
						<DetailRow label="Entry">
							<span className="font-mono">{node.entryKey}</span>
						</DetailRow>
					)}
					{node.componentKey !== undefined && (
						<DetailRow label="Key">
							<span className="font-mono">{node.componentKey}</span>
						</DetailRow>
					)}
					{node.id && (
						<DetailRow label="DOM id">
							<span className="font-mono">#{node.id}</span>
						</DetailRow>
					)}
					{isSlot && (
						<>
							<DetailRow label="Hosts">{node.mounted ?? 0}</DetailRow>
							<DetailRow label="Repeatable">
								{node.repeatable ? "yes" : "no"}
							</DetailRow>
							<DetailRow label="Apps">
								{node.apps?.length ? node.apps.join(", ") : "—"}
							</DetailRow>
						</>
					)}
					{node.kind !== "text" && node.kind !== "signal" && (
						<DetailRow label="Children">{node.children.length}</DetailRow>
					)}
					{node.controlFlow?.signal && (
						<DetailRow label="Mounts">
							{node.controlFlow.active ?? "nothing"}
						</DetailRow>
					)}
					{node.branch && (
						<DetailRow label="Mounted">
							{node.branch.active ? "yes" : "no"}
						</DetailRow>
					)}
				</div>

				{node.inactive && (
					<div className="flex gap-2 rounded border px-2 py-1.5 text-[11px] text-muted-foreground">
						<InfoIcon className="size-3.5 shrink-0 mt-0.5" />
						<span>
							It is in the app's tree, but inside a branch the page does not
							mount right now, so it is not on the page.
						</span>
					</div>
				)}

				{node.controlFlow && !node.controlFlow.signal && (
					<div className="flex gap-2 rounded border border-red-500/40 bg-red-500/10 px-2 py-1.5 text-[11px] text-red-700 dark:text-red-300">
						<TriangleAlertIcon className="size-3.5 shrink-0 mt-0.5" />
						<span>
							<code>{node.controlFlow.kind === "show" ? "when" : "of"}</code> is
							not a signal of this app, so the page renders nothing here.
						</span>
					</div>
				)}

				{node.signal && (
					<SignalDetail
						label="Signal"
						signal={node.signal}
						onOpenSignal={onOpenSignal}
					/>
				)}

				{node.controlFlow?.signal && (
					<SignalDetail
						label={node.controlFlow.kind === "show" ? "When" : "Of"}
						signal={node.controlFlow.signal}
						onOpenSignal={onOpenSignal}
					/>
				)}

				{node.controlFlow?.outcome && node.controlFlow.signal && (
					<ConditionSteps outcome={node.controlFlow.outcome} />
				)}

				{node.branch?.outcome && (
					<ConditionSteps outcome={node.branch.outcome} />
				)}

				{node.signalProps?.map((signal) => (
					<SignalDetail
						key={signal.prop}
						label={`Signal in "${signal.prop}"`}
						signal={signal}
						onOpenSignal={onOpenSignal}
					/>
				))}

				{hasValue && (
					<div className="space-y-1">
						<span className="text-[10px] uppercase tracking-wide text-muted-foreground">
							Value
						</span>
						<div className="rounded border px-2 py-1.5 text-xs">
							<JsonViewer
								data={{ value: values[node.id as string] }}
								name={false}
								collapsed={2}
							/>
						</div>
					</div>
				)}

				{hasProps && (
					<div className="space-y-1">
						<span className="text-[10px] uppercase tracking-wide text-muted-foreground">
							Props
						</span>
						<div className="rounded border px-2 py-1.5 text-xs">
							<JsonViewer data={node.props} name={false} collapsed={1} />
						</div>
					</div>
				)}

				{node.kind === "text" && (
					<pre className="rounded border px-2 py-1.5 text-xs font-mono whitespace-pre-wrap wrap-break-word">
						{node.name}
					</pre>
				)}
			</div>
		</div>
	);
}
