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
import type { NubeSDKStorageRecord } from "@/contexts/nube-sdk-storage-context";
import { useNubeSDKStorage } from "@/contexts/nube-sdk-storage-context";
import Layout from "@/devtools/components/layout";
import {
	Expiration,
	RelativeTime,
	isExpired,
} from "@/devtools/components/relative-time";
import { SearchInput } from "@/devtools/components/search-input";
import { usePanelVisibility } from "@/devtools/hooks";
import {
	HIGHLIGHT_DURATION,
	useChangeHighlight,
} from "@/hooks/use-change-highlight";
import type { PageStorageType } from "@/utils";
import { unwrapStorageValue, wrapStorageValue } from "@/utils/storage-value";
import { DatabaseIcon, FilterIcon, InfoIcon, Trash2Icon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const PANEL_WIDTH_KEY = "nube-devtools-storages-page-width";
const SEARCH_STORAGE_KEY = "nube-devtools-storages-filter-search";

/**
 * How often this page re-reads the inspected tab's storages.
 *
 * An app's own write shows up instantly through the patched `setItem`, so this
 * poll is not what makes the panel live — it is the safety net for the writes
 * nothing can report: an edit made from Chrome's own Application panel or by
 * another extension bypasses JavaScript entirely, and fires no event of any
 * kind in the page.
 */
const POLL_INTERVAL = 2_000;

const FILTER_SELECT_CLASS =
	"h-5 shrink-0 rounded border bg-transparent px-1.5 text-[12px] outline-none";

const TYPE_FILTER_ALL = "all";
const APP_FILTER_ALL = "all";

type TypeFilter = typeof TYPE_FILTER_ALL | PageStorageType;

const TYPE_LABEL: Record<PageStorageType, string> = {
	localStorage: "localStorage",
	sessionStorage: "sessionStorage",
};

/**
 * Storage type colors, matching nothing else in the panel on purpose: the type
 * is the one property that changes how an entry behaves (one survives the tab,
 * the other does not), so it is worth telling apart at a glance.
 */
const TYPE_BADGE_CLASS: Record<PageStorageType, string> = {
	localStorage:
		"border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300",
	sessionStorage:
		"border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
};

/**
 * Sorted by how recently the panel saw the value change, so a write that just
 * happened surfaces at the top. Entries of unknown age sink below the observed
 * ones and are ordered by key, which at least makes them predictable to scan.
 */
function compareRecords(a: NubeSDKStorageRecord, b: NubeSDKStorageRecord) {
	if (a.updatedAt !== null && b.updatedAt !== null) {
		return b.updatedAt - a.updatedAt;
	}
	if (a.updatedAt !== null) return -1;
	if (b.updatedAt !== null) return 1;
	return a.key.localeCompare(b.key);
}

export function Storages() {
	const { records, isLoading, refresh, saveValue, removeRecord } =
		useNubeSDKStorage();

	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [search, setSearch] = useState(
		() => localStorage.getItem(SEARCH_STORAGE_KEY) || "",
	);
	const [typeFilter, setTypeFilter] = useState<TypeFilter>(TYPE_FILTER_ALL);
	const [appFilter, setAppFilter] = useState<string>(APP_FILTER_ALL);

	useEffect(() => {
		localStorage.setItem(SEARCH_STORAGE_KEY, search);
	}, [search]);

	// Polls only while this page is actually on screen. Leaving it unmounts the
	// page and tears the interval down; switching to another DevTools tab keeps
	// it mounted, which is what `isPanelVisible` is for.
	const isPanelVisible = usePanelVisibility();

	useEffect(() => {
		if (!isPanelVisible) return;

		// Becoming visible is itself a reason to re-read: the list went
		// unwatched, and changes the push stream cannot observe may have
		// happened meanwhile.
		refresh();

		const interval = setInterval(refresh, POLL_INTERVAL);
		return () => clearInterval(interval);
	}, [refresh, isPanelVisible]);

	const appIds = useMemo(
		() => [...new Set(records.map((record) => record.appId))].sort(),
		[records],
	);

	const visibleRecords = useMemo(() => {
		const term = search.trim().toLowerCase();

		return records
			.filter((record) => {
				if (typeFilter !== TYPE_FILTER_ALL && record.type !== typeFilter) {
					return false;
				}
				if (appFilter !== APP_FILTER_ALL && record.appId !== appFilter) {
					return false;
				}
				if (!term) return true;
				return (
					record.key.toLowerCase().includes(term) ||
					record.appId.toLowerCase().includes(term)
				);
			})
			.sort(compareRecords);
	}, [records, search, typeFilter, appFilter]);

	// Selection follows the entry, not the row: the list reorders as writes
	// come in, and the selected key can also be deleted by the page itself.
	const selectedRecord = useMemo(
		() => records.find((record) => record.id === selectedId) ?? null,
		[records, selectedId],
	);

	return (
		<Layout>
			<div className="flex h-full flex-col">
				<nav className="flex items-center justify-between px-1.5 py-1 border-b h-[33px] shrink-0">
					<div className="flex items-center min-w-0">
						<SidebarTrigger />
						<Divider />
						<DatabaseIcon className="size-3 shrink-0" />
						<span className="ml-1.5 text-xs font-medium">Storage</span>
						<span className="ml-2 text-xs text-muted-foreground truncate hidden sm:inline">
							Data persisted by your apps
						</span>
					</div>
					<div className="flex items-center gap-1.5 shrink-0">
						<span
							className="flex items-center gap-1 text-[10px] text-muted-foreground"
							title={`App writes appear as they happen. Anything JavaScript cannot report — an edit from Chrome's Application panel, say — is picked up within ${POLL_INTERVAL / 1000}s.`}
						>
							<span className="size-1.5 rounded-full bg-emerald-500" />
							live
						</span>
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<span className="inline-flex">
										<InfoIcon className="size-3 text-muted-foreground" />
									</span>
								</TooltipTrigger>
								<TooltipContent className="max-w-xs">
									Entries are grouped by key: a write replaces the existing
									value instead of adding a row. Only keys namespaced by NubeSDK
									(<code>app-&lt;appId&gt;-&lt;key&gt;</code>) are listed.
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
							placeholder="Filter by key or app..."
						/>
					</div>
					<FilterIcon className="size-3 text-muted-foreground shrink-0 ml-1" />
					<select
						aria-label="Storage type"
						className={FILTER_SELECT_CLASS}
						value={typeFilter}
						onChange={(event) =>
							setTypeFilter(event.target.value as TypeFilter)
						}
					>
						<option value={TYPE_FILTER_ALL}>All types</option>
						<option value="localStorage">localStorage</option>
						<option value="sessionStorage">sessionStorage</option>
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
							<RecordList
								records={visibleRecords}
								total={records.length}
								isLoading={isLoading}
								selectedId={selectedRecord?.id ?? null}
								onSelect={(record) => setSelectedId(record.id)}
							/>
						</ResizablePanel>
						<ResizableHandle />
						<ResizablePanel>
							<RecordDetail
								record={selectedRecord}
								onSave={saveValue}
								onRemove={async (record) => {
									const removed = await removeRecord(record);
									if (removed) setSelectedId(null);
									return removed;
								}}
							/>
						</ResizablePanel>
					</ResizablePanelGroup>
				</div>
			</div>
		</Layout>
	);
}

type RecordListProps = {
	records: NubeSDKStorageRecord[];
	total: number;
	/** The first read has not resolved yet, so "empty" is not yet known. */
	isLoading: boolean;
	selectedId: string | null;
	onSelect: (record: NubeSDKStorageRecord) => void;
};

function RecordList({
	records,
	total,
	isLoading,
	selectedId,
	onSelect,
}: RecordListProps) {
	if (records.length === 0) {
		// Three distinct empty states. Nothing read yet is not the same as
		// nothing stored, and a filter matching nothing is the user's own doing
		// — offering to reload the page there would be the wrong advice.
		if (isLoading) {
			return (
				<div className="flex h-full items-center justify-center px-4">
					<p className="text-xs text-muted-foreground">
						Reading the page's storage...
					</p>
				</div>
			);
		}

		if (total === 0) {
			return (
				<div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
					<p className="text-sm">No storage data found</p>
					<p className="text-xs text-muted-foreground max-w-xs">
						Nothing has been persisted through NubeSDK on this page yet. The
						list updates on its own as apps write.
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
					Persisted data
				</span>
				<span className="text-xs">
					{records.length} {records.length === 1 ? "entry" : "entries"}
					{records.length !== total ? ` of ${total}` : ""}
				</span>
			</div>
			<ul className="flex-1 overflow-y-auto">
				{records.map((record) => (
					<RecordRow
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

type RecordRowProps = {
	record: NubeSDKStorageRecord;
	isSelected: boolean;
	onSelect: (record: NubeSDKStorageRecord) => void;
};

function RecordRow({ record, isSelected, onSelect }: RecordRowProps) {
	// Whether this row stands for a key that was written moments ago, which is
	// read from the record rather than from the row mounting.
	//
	// Mounting is the wrong signal here: rows come and go as the filters
	// change, so clearing a filter would flash the whole list and dilute what
	// the tint means. An entry from the opening snapshot has no observed write
	// time at all, so it never qualifies.
	const isNewlyWritten =
		record.updatedAt !== null &&
		Date.now() - record.updatedAt < HIGHLIGHT_DURATION;

	// Keyed on the stored payload, so a rewrite tints the row wherever it came
	// from — an app's `setItem`, another tab, or an edit the poll picked up.
	// That path does not involve mounting, so it works for rows that were
	// already on screen.
	const isHighlighted = useChangeHighlight(record.value, isNewlyWritten);

	return (
		<li>
			<button
				type="button"
				onClick={() => onSelect(record)}
				className={`flex w-full items-center gap-2 px-3 py-2 text-left border-b transition-colors duration-1000 hover:bg-accent/50 ${
					isHighlighted ? "bg-amber-500/20" : ""
				} ${
					isSelected
						? "shadow-[inset_2px_0_0_0_rgb(180,83,9)] bg-accent/30"
						: ""
				}`}
			>
				<div className="min-w-0 flex-1">
					<div className="truncate text-xs font-medium" title={record.key}>
						{record.key}
					</div>
					<div
						className="truncate text-[11px] text-muted-foreground"
						title={record.appId}
					>
						{record.appId}
					</div>
				</div>
				{record.expiresAt !== null &&
					isExpired(record.expiresAt, Date.now()) && (
						<Badge
							variant="outline"
							className="text-[10px] px-1 py-0.5 shrink-0 border-destructive/40 bg-destructive/10 text-destructive"
							title="Past its TTL: still in storage, but NubeSDK reads it as absent"
						>
							expired
						</Badge>
					)}
				<Badge
					variant="outline"
					className={`text-[10px] px-1 py-0.5 shrink-0 ${TYPE_BADGE_CLASS[record.type]}`}
				>
					{TYPE_LABEL[record.type]}
				</Badge>
				<div className="shrink-0 w-16 text-right">
					<RelativeTime
						timestamp={record.updatedAt}
						fallback="—"
						className="block text-[11px] text-muted-foreground"
					/>
					{record.expiresAt !== null && (
						<Expiration
							expiresAt={record.expiresAt}
							className="block text-[10px] text-muted-foreground data-[expired=true]:text-destructive"
						/>
					)}
				</div>
			</button>
		</li>
	);
}

type RecordDetailProps = {
	record: NubeSDKStorageRecord | null;
	onSave: (record: NubeSDKStorageRecord, value: string) => Promise<boolean>;
	onRemove: (record: NubeSDKStorageRecord) => Promise<boolean>;
};

function RecordDetail({ record, onSave, onRemove }: RecordDetailProps) {
	const [draft, setDraft] = useState("");
	const [isSaving, setIsSaving] = useState(false);

	// The editor works on the value inside the envelope NubeSDK persists, never
	// on the envelope itself: its `value` key is what the SDK reads an entry
	// back through, and renaming or dropping it would make the app's data
	// unreachable with nothing on screen to explain it.
	const unwrapped = useMemo(
		() => unwrapStorageValue(record?.value ?? ""),
		[record?.value],
	);

	// The draft is re-seeded when the selection changes *or* when the stored
	// value does. An app that rewrites the key while it is open would otherwise
	// leave a stale draft that silently reverts the app's write on save.
	// `record.id` is needed on its own: switching between two entries that
	// happen to hold the same value would otherwise not re-seed the draft.
	// biome-ignore lint/correctness/useExhaustiveDependencies: see above
	useEffect(() => {
		setDraft(unwrapped.text);
	}, [record?.id, unwrapped.text]);

	if (!record) {
		return (
			<div className="flex h-full items-center justify-center px-4">
				<p className="text-xs text-muted-foreground">
					Select an entry to inspect and edit its value.
				</p>
			</div>
		);
	}

	const isDirty = draft !== unwrapped.text;
	const metadataEntries = Object.entries(unwrapped.metadata);

	const handleSave = async () => {
		// Re-wrapped before it reaches the page, so the TTL and anything else
		// the envelope carries survive an edit untouched.
		const wrapped = wrapStorageValue(unwrapped, draft);
		if (!wrapped.ok) {
			toast.error(wrapped.error);
			return;
		}

		setIsSaving(true);
		try {
			const saved = await onSave(record, wrapped.raw);
			if (saved) {
				toast.success(`${record.key} updated`);
			} else {
				toast.error(`Could not write ${record.key} to ${record.type}`);
			}
		} finally {
			setIsSaving(false);
		}
	};

	const handleRemove = async () => {
		const removed = await onRemove(record);
		if (removed) {
			toast.success(`${record.key} removed`);
		} else {
			toast.error(`Could not remove ${record.key} from ${record.type}`);
		}
	};

	return (
		<div className="flex h-full flex-col">
			<div className="flex items-center justify-between gap-2 px-3 py-1.5 border-b shrink-0">
				<div className="min-w-0">
					<span className="text-[10px] uppercase tracking-wide text-muted-foreground">
						Entry details
					</span>
					<div className="truncate text-xs font-medium" title={record.key}>
						{record.key}
					</div>
				</div>
				<div className="flex items-center gap-1 shrink-0">
					<Badge
						variant="outline"
						className={`text-[10px] px-1 py-0.5 ${TYPE_BADGE_CLASS[record.type]}`}
					>
						{TYPE_LABEL[record.type]}
					</Badge>
					<Button
						variant="ghost"
						size="icon"
						className="h-6 w-6"
						title="Remove this entry from the page's storage"
						onClick={handleRemove}
					>
						<Trash2Icon className="size-3" />
					</Button>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto p-3 space-y-2">
				<div className="flex flex-col">
					<span className="text-[10px] uppercase tracking-wide text-muted-foreground">
						App
					</span>
					<span className="text-foreground">{record.appId}</span>
				</div>

				<div className="flex items-center justify-between gap-2">
					<span className="text-[10px] uppercase tracking-wide text-muted-foreground">
						Stored value
					</span>
					<Button
						variant="outline"
						size="sm"
						className="h-5 px-2 text-xs"
						disabled={!isDirty || isSaving}
						onClick={handleSave}
					>
						Save
					</Button>
				</div>

				{/* A raw textarea, not the JSON viewer: the value an app stores is a
				    string as far as the `setItem` contract goes, and editing has to
				    round-trip it exactly. */}
				<textarea
					spellCheck={false}
					value={draft}
					onChange={(event) => setDraft(event.target.value)}
					className="w-full min-h-20 resize-y rounded border bg-transparent p-2 font-mono text-xs outline-none focus-visible:border-ring"
				/>

				{unwrapped.encoding === "json" && (
					<p className="text-[11px] text-muted-foreground">
						This value is not a string, so it is shown as JSON and has to stay
						valid JSON to be saved.
					</p>
				)}

				{unwrapped.encoding === "raw" && (
					<p className="text-[11px] text-amber-600 dark:text-amber-400">
						This entry is not wrapped the way NubeSDK writes one, so the whole
						stored payload is shown. Saving replaces it verbatim.
					</p>
				)}

				{metadataEntries.length > 0 && (
					<div className="rounded border px-2 py-1.5 space-y-0.5">
						<span className="text-[10px] uppercase tracking-wide text-muted-foreground">
							Envelope metadata
						</span>
						{/* Read-only: this is NubeSDK's own bookkeeping — the TTL it
						    enforces on read — and it is shown to explain why the stored
						    payload is larger than the value above, not to be edited. */}
						{metadataEntries.map(([name, value]) => (
							<div key={name} className="text-[11px] text-muted-foreground">
								{name}:{" "}
								<span className="font-mono text-foreground">
									{typeof value === "string" ? value : JSON.stringify(value)}
								</span>
							</div>
						))}
					</div>
				)}

				<div className="space-y-0.5 text-[11px] text-muted-foreground">
					<div>
						Last observed write:{" "}
						<RelativeTime
							timestamp={record.updatedAt}
							fallback="not observed in this session"
						/>
					</div>
					<div>
						TTL:{" "}
						{unwrapped.expiresAt === null ? (
							<span>none — stored indefinitely</span>
						) : (
							<Expiration
								expiresAt={unwrapped.expiresAt}
								verbose
								className="data-[expired=true]:text-destructive"
							/>
						)}
					</div>
				</div>

				{unwrapped.expiresAt !== null &&
					isExpired(unwrapped.expiresAt, Date.now()) && (
						<p className="text-[11px] text-destructive">
							This entry is past its TTL. It is still in the page's storage —
							nothing sweeps it — but NubeSDK reads it as absent, so the app no
							longer sees this value. Saving a new value here does not extend
							the TTL.
						</p>
					)}

				<div
					className="text-[11px] text-muted-foreground break-all"
					title={record.storageKey}
				>
					Key: <span className="font-mono">{record.storageKey}</span>
				</div>
			</div>
		</div>
	);
}
