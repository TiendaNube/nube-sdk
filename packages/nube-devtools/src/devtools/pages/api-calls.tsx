import type { NubeSDKCommandStatus } from "@/background/scripts";
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
	type NubeSDKCommandRecord,
	useNubeSDKCommands,
} from "@/contexts/nube-sdk-commands-context";
import { JsonViewer } from "@/devtools/components/json-viewer";
import Layout from "@/devtools/components/layout";
import { formatAbsoluteDateTime } from "@/devtools/components/relative-time";
import { SearchInput } from "@/devtools/components/search-input";
import { useChangeHighlight } from "@/hooks/use-change-highlight";
import {
	ArrowRightLeftIcon,
	FilterIcon,
	InfoIcon,
	TrashIcon,
} from "lucide-react";
import { type ReactNode, useEffect, useMemo, useState } from "react";

const PANEL_WIDTH_KEY = "nube-devtools-api-calls-page-width";
const SEARCH_STORAGE_KEY = "nube-devtools-api-calls-filter-search";

const FILTER_SELECT_CLASS =
	"h-5 shrink-0 rounded border bg-transparent px-1.5 text-[12px] outline-none";

const STATUS_FILTER_ALL = "all";
const APP_FILTER_ALL = "all";

type StatusFilter = typeof STATUS_FILTER_ALL | NubeSDKCommandStatus;

const STATUS_BADGE_CLASS: Record<NubeSDKCommandStatus, string> = {
	pending:
		"border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
	success:
		"border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
	error: "border-destructive/40 bg-destructive/10 text-destructive",
};

/**
 * How a call ended, as the app sees it.
 *
 * The wire status alone is not enough: some APIs (Customization, for one)
 * never throw and report failure through the result instead —
 * `{ ok: false, code, reason }`. Over the wire that is a successful response,
 * but for whoever debugs the app it is as much a failure as a thrown error.
 */
type CallOutcome =
	| { status: "pending" | "success" }
	| {
			status: "error";
			code: string;
			message: string;
			/** Whether the handler threw, or returned a failed result. */
			source: "exception" | "result";
	  };

function isFailedResult(
	result: unknown,
): result is { ok: false; code?: unknown; reason?: unknown } {
	return (
		result !== null &&
		typeof result === "object" &&
		!Array.isArray(result) &&
		(result as { ok?: unknown }).ok === false
	);
}

function callOutcome(record: NubeSDKCommandRecord): CallOutcome {
	if (record.status === "error") {
		return {
			status: "error",
			code: record.error?.code ?? "error",
			message: record.error?.message ?? "",
			source: "exception",
		};
	}
	if (record.status === "success" && isFailedResult(record.result)) {
		const { code, reason } = record.result;
		return {
			status: "error",
			code: typeof code === "string" ? code : "failed",
			message: typeof reason === "string" ? reason : "",
			source: "result",
		};
	}
	return { status: record.status };
}

/** The error code is the useful label for a failed call, not "error". */
function outcomeLabel(outcome: CallOutcome): string {
	return outcome.status === "error" ? outcome.code : outcome.status;
}

function formatCallDuration(duration: number | null): string {
	if (duration === null) return "…";
	if (duration < 1) return "<1ms";
	if (duration < 1_000) return `${Math.round(duration)}ms`;
	return `${(duration / 1_000).toFixed(2)}s`;
}

function commandName(record: NubeSDKCommandRecord): string {
	return `${record.scope}.${record.command}`;
}

export function ApiCalls() {
	const { records, isLoading, clearRecords } = useNubeSDKCommands();

	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [search, setSearch] = useState(
		() => localStorage.getItem(SEARCH_STORAGE_KEY) || "",
	);
	const [statusFilter, setStatusFilter] =
		useState<StatusFilter>(STATUS_FILTER_ALL);
	const [appFilter, setAppFilter] = useState<string>(APP_FILTER_ALL);

	useEffect(() => {
		localStorage.setItem(SEARCH_STORAGE_KEY, search);
	}, [search]);

	const appIds = useMemo(
		() => [...new Set(records.map((record) => record.appId))].sort(),
		[records],
	);

	// Newest first: the call someone is debugging is almost always the last
	// one, and this keeps it in view without any scroll management.
	const visibleRecords = useMemo(() => {
		const term = search.trim().toLowerCase();

		return records
			.filter((record) => {
				if (
					statusFilter !== STATUS_FILTER_ALL &&
					callOutcome(record).status !== statusFilter
				) {
					return false;
				}
				if (appFilter !== APP_FILTER_ALL && record.appId !== appFilter) {
					return false;
				}
				if (!term) return true;
				return (
					commandName(record).toLowerCase().includes(term) ||
					record.appId.toLowerCase().includes(term)
				);
			})
			.reverse();
	}, [records, search, statusFilter, appFilter]);

	// Selection follows the call, not the row: a pending call is replaced by
	// its settled record under the same id.
	const selectedRecord = useMemo(
		() => records.find((record) => record.id === selectedId) ?? null,
		[records, selectedId],
	);

	const handleClear = () => {
		setSelectedId(null);
		clearRecords();
	};

	return (
		<Layout>
			<div className="flex h-full flex-col">
				<nav className="flex items-center justify-between px-1.5 py-1 border-b h-[33px] shrink-0">
					<div className="flex items-center min-w-0">
						<SidebarTrigger />
						<Divider />
						<Button
							disabled={records.length === 0}
							variant="ghost"
							size="icon"
							className="h-6 w-6"
							title="Clear the list"
							onClick={handleClear}
						>
							<TrashIcon className="size-3" />
						</Button>
						<Divider />
						<ArrowRightLeftIcon className="size-3 shrink-0" />
						<span className="ml-1.5 text-xs font-medium">API Calls</span>
						<span className="ml-2 text-xs text-muted-foreground truncate hidden sm:inline">
							nube.api calls made by your apps
						</span>
					</div>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<span className="inline-flex shrink-0">
									<InfoIcon className="size-3 text-muted-foreground" />
								</span>
							</TooltipTrigger>
							<TooltipContent className="max-w-xs">
								Every call an app's worker sends through the command bridge (
								<code>nube.api.*</code>), with the params it sent and the result
								or error it got back. Durations include the time the SDK waits
								for a handler that has not been registered yet.
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</nav>

				<div className="flex items-center gap-1 px-1.5 py-1 border-b shrink-0">
					<div className="flex items-center flex-1 min-w-0 max-w-xs">
						<SearchInput
							value={search}
							onChange={setSearch}
							placeholder="Filter by command or app..."
						/>
					</div>
					<FilterIcon className="size-3 text-muted-foreground shrink-0 ml-1" />
					<select
						aria-label="Status"
						className={FILTER_SELECT_CLASS}
						value={statusFilter}
						onChange={(event) =>
							setStatusFilter(event.target.value as StatusFilter)
						}
					>
						<option value={STATUS_FILTER_ALL}>All statuses</option>
						<option value="pending">Pending</option>
						<option value="success">Success</option>
						<option value="error">Error</option>
					</select>
					<select
						aria-label="App"
						className={`${FILTER_SELECT_CLASS} max-w-45`}
						value={appFilter}
						onChange={(event) => setAppFilter(event.target.value)}
					>
						<option value={APP_FILTER_ALL}>All apps</option>
						{appIds.map((appId) => (
							<option key={appId} value={appId}>
								{appId}
							</option>
						))}
					</select>
				</div>

				<div className="flex-1 overflow-hidden">
					<ResizablePanelGroup
						autoSaveId={PANEL_WIDTH_KEY}
						storage={localStorage}
						direction="horizontal"
					>
						<ResizablePanel defaultSize={45}>
							<CallList
								records={visibleRecords}
								total={records.length}
								isLoading={isLoading}
								selectedId={selectedRecord?.id ?? null}
								onSelect={(record) => setSelectedId(record.id)}
							/>
						</ResizablePanel>
						<ResizableHandle />
						<ResizablePanel>
							<CallDetail record={selectedRecord} />
						</ResizablePanel>
					</ResizablePanelGroup>
				</div>
			</div>
		</Layout>
	);
}

type CallListProps = {
	records: NubeSDKCommandRecord[];
	total: number;
	isLoading: boolean;
	selectedId: string | null;
	onSelect: (record: NubeSDKCommandRecord) => void;
};

function CallList({
	records,
	total,
	isLoading,
	selectedId,
	onSelect,
}: CallListProps) {
	if (records.length === 0) {
		if (isLoading) {
			return (
				<div className="flex h-full items-center justify-center px-4">
					<p className="text-xs text-muted-foreground">
						Reading the page's API calls...
					</p>
				</div>
			);
		}

		if (total === 0) {
			return (
				<div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
					<p className="text-sm">No API calls yet</p>
					<p className="text-xs text-muted-foreground max-w-xs">
						Calls appear here as apps use <code>nube.api</code>. Reload to
						capture the ones made while the page loads.
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
					No call matches the current filters.
				</p>
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col">
			<div className="flex items-center justify-between px-3 py-1.5 border-b shrink-0">
				<span className="text-[10px] uppercase tracking-wide text-muted-foreground">
					Calls
				</span>
				<span className="text-xs">
					{records.length} {records.length === 1 ? "call" : "calls"}
					{records.length !== total ? ` of ${total}` : ""}
				</span>
			</div>
			<ul className="flex-1 overflow-y-auto">
				{records.map((record) => (
					<CallRow
						key={record.id}
						record={record}
						isSelected={record.id === selectedId}
						onSelect={onSelect}
					/>
				))}
			</ul>
		</div>
	);
}

type CallRowProps = {
	record: NubeSDKCommandRecord;
	isSelected: boolean;
	onSelect: (record: NubeSDKCommandRecord) => void;
};

function CallRow({ record, isSelected, onSelect }: CallRowProps) {
	const outcome = callOutcome(record);
	// Tinted when the call shows up and again when it settles.
	const isHighlighted = useChangeHighlight(record.status, true);

	return (
		<li>
			<button
				type="button"
				onClick={() => onSelect(record)}
				className={`flex w-full items-center gap-2 px-3 py-2 text-left border-b transition-colors duration-1000 hover:bg-accent/50 cursor-pointer ${
					isHighlighted ? "bg-amber-500/20" : ""
				} ${
					isSelected
						? "shadow-[inset_2px_0_0_0_rgb(180,83,9)] bg-accent/30"
						: ""
				}`}
			>
				<div className="min-w-0 flex-1">
					<div
						className="truncate text-xs font-medium font-mono"
						title={commandName(record)}
					>
						{commandName(record)}
					</div>
					<div
						className="truncate text-[11px] text-muted-foreground"
						title={record.appId}
					>
						{record.appId}
					</div>
				</div>
				<Badge
					variant="outline"
					className={`text-[10px] px-1 py-0.5 shrink-0 ${STATUS_BADGE_CLASS[outcome.status]}`}
				>
					{outcomeLabel(outcome)}
				</Badge>
				<span className="shrink-0 w-14 text-right text-[11px] tabular-nums">
					{formatCallDuration(record.duration)}
				</span>
			</button>
		</li>
	);
}

function CallDetail({ record }: { record: NubeSDKCommandRecord | null }) {
	if (!record) {
		return (
			<div className="flex h-full items-center justify-center px-4">
				<p className="text-xs text-muted-foreground">
					Select a call to inspect its params and response.
				</p>
			</div>
		);
	}

	const outcome = callOutcome(record);

	return (
		<div className="flex h-full flex-col">
			<div className="flex items-center justify-between gap-2 px-3 py-1.5 border-b shrink-0">
				<div className="min-w-0">
					<span className="text-[10px] uppercase tracking-wide text-muted-foreground">
						Call details
					</span>
					<div
						className="truncate text-xs font-medium font-mono"
						title={commandName(record)}
					>
						{commandName(record)}
					</div>
				</div>
				<Badge
					variant="outline"
					className={`text-[10px] px-1 py-0.5 shrink-0 ${STATUS_BADGE_CLASS[outcome.status]}`}
				>
					{outcomeLabel(outcome)}
				</Badge>
			</div>

			<div className="flex-1 overflow-y-auto p-3 space-y-3">
				<div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-[11px]">
					<span className="text-muted-foreground">App</span>
					<span className="break-all">{record.appId}</span>
					<span className="text-muted-foreground">Scope</span>
					<span className="font-mono">{record.scope}</span>
					<span className="text-muted-foreground">Command</span>
					<span className="font-mono">{record.command}</span>
					<span className="text-muted-foreground">Started</span>
					<span>{formatAbsoluteDateTime(record.startedAt)}</span>
					<span className="text-muted-foreground">Duration</span>
					<span className="tabular-nums">
						{record.duration === null
							? "pending"
							: formatCallDuration(record.duration)}
					</span>
				</div>

				<Section title="Params">
					<ValueView value={record.params} name="params" empty="No params" />
				</Section>

				{outcome.status === "error" && (
					<Section title="Error">
						<div className="rounded border border-destructive/40 bg-destructive/10 px-2 py-1.5 space-y-0.5">
							<div className="text-[11px] font-mono text-destructive">
								{outcome.code}
							</div>
							{outcome.message && (
								<div className="text-xs break-words">{outcome.message}</div>
							)}
						</div>
						{outcome.source === "result" && (
							<p className="text-[11px] text-muted-foreground">
								Returned as a result with <code>ok: false</code> — the call did
								not throw, so the app has to check <code>ok</code> to notice it.
							</p>
						)}
					</Section>
				)}

				{record.status === "success" && (
					<Section title="Result">
						<ValueView
							value={record.result}
							name="result"
							empty="No result (undefined)"
						/>
					</Section>
				)}

				{record.status === "pending" && (
					<p className="text-[11px] text-muted-foreground">
						Waiting for the handler to respond...
					</p>
				)}
			</div>
		</div>
	);
}

function Section({ title, children }: { title: string; children: ReactNode }) {
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
 * The JSON viewer only takes objects, and a command can just as well send or
 * return a string, a number or null.
 */
function ValueView({
	value,
	name,
	empty,
}: { value: unknown; name: string; empty: string }) {
	if (value === undefined) {
		return <p className="text-[11px] text-muted-foreground">{empty}</p>;
	}

	if (value !== null && typeof value === "object") {
		return (
			<JsonViewer
				className="text-sm overflow-x-auto"
				data={value}
				name={name}
				collapsed={2}
			/>
		);
	}

	return (
		<pre className="rounded border px-2 py-1.5 font-mono text-xs whitespace-pre-wrap break-all">
			{JSON.stringify(value)}
		</pre>
	);
}
