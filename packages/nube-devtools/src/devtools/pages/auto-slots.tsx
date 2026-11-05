import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { Input } from "@/components/ui/input";
import {
	NativeSelect,
	NativeSelectOption,
} from "@/components/ui/native-select";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import Layout from "@/devtools/components/layout";
import {
	copyToClipboard,
	downloadFile,
	getPageStorage,
	setPageStorage,
} from "@/utils";
import {
	AUTO_SLOTS_STORAGE_KEY,
	AUTO_SLOT_PICKS,
	AUTO_SLOT_POSITIONS,
	type AutoSlotEntry,
	EMPTY_ENTRY,
	type StoredAutoSlots,
	buildOverridesScript,
	entriesToOverrides,
	overridesScriptFilename,
	overridesToEntries,
	parseOverridesScript,
	parseStoredAutoSlots,
	validateEntries,
} from "@/utils/auto-slots";
import {
	CopyIcon,
	DownloadIcon,
	LayoutTemplate,
	Plus,
	Trash2,
	UploadIcon,
} from "lucide-react";
import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type PageInfo = { host: string; slots: string[] };

// The store's host (for the export) and the slot names on the page (as
// suggestions): the auto slots the engine created and the ones the page renders.
const PAGE_INFO_EXPRESSION = `({
	host: location.hostname,
	slots: Array.from(new Set(Array.from(document.querySelectorAll("[data-nubesdk-slot]"), (el) => el.getAttribute("data-nubesdk-slot")).filter(Boolean))).sort(),
})`;

const SLOT_NAMES_LIST_ID = "auto-slot-names";

const readPageInfo = () =>
	new Promise<PageInfo>((resolve) => {
		chrome.devtools.inspectedWindow.eval<PageInfo>(
			PAGE_INFO_EXPRESSION,
			(result, exception) => {
				resolve(exception || !result ? { host: "", slots: [] } : result);
			},
		);
	});

// Inputs look like plain cells until they are focused.
const CELL_INPUT_CLASS =
	"h-7 rounded-none border-0 bg-transparent dark:bg-transparent px-1.5 font-mono text-xs shadow-none md:text-xs";
const CELL_SELECT_CLASS =
	"w-full [&_select]:h-7 [&_select]:rounded-none [&_select]:border-0 [&_select]:bg-transparent [&_select]:pl-1.5 [&_select]:pr-6 [&_select]:text-xs [&_svg]:right-1 [&_svg]:size-3";
const CELL_CLASS = "p-0 border-r last:border-r-0 align-middle";

const COLUMNS = [
	{ label: "Slot", className: "w-[330px]" },
	{ label: "Anchor (CSS selector)", className: "" },
	{ label: "Position", className: "w-[118px]" },
	{ label: "Pick", className: "w-[90px]", title: "Only used by slots you add" },
	{ label: "Style", className: "" },
	{ label: "", className: "w-8" },
];

const EntryRow = ({
	entry,
	error,
	onChange,
	onRemove,
}: {
	entry: AutoSlotEntry;
	error?: string;
	onChange: (changes: Partial<AutoSlotEntry>) => void;
	onRemove: () => void;
}) => (
	<>
		<TableRow className={error ? "border-b-0" : undefined}>
			<TableCell className={CELL_CLASS}>
				<Input
					aria-label="Slot"
					aria-invalid={!!error}
					list={SLOT_NAMES_LIST_ID}
					placeholder="after_header"
					title={entry.slot}
					value={entry.slot}
					onChange={(event) => onChange({ slot: event.target.value })}
					className={CELL_INPUT_CLASS}
				/>
			</TableCell>
			<TableCell className={CELL_CLASS}>
				<Input
					aria-label="Anchor"
					placeholder="Unchanged"
					title={entry.anchor}
					value={entry.anchor}
					onChange={(event) => onChange({ anchor: event.target.value })}
					className={CELL_INPUT_CLASS}
				/>
			</TableCell>
			<TableCell className={CELL_CLASS}>
				<NativeSelect
					aria-label="Position"
					size="sm"
					value={entry.position}
					onChange={(event) =>
						onChange({
							position: event.target.value as AutoSlotEntry["position"],
						})
					}
					className={CELL_SELECT_CLASS}
				>
					<NativeSelectOption value="">Unchanged</NativeSelectOption>
					{AUTO_SLOT_POSITIONS.map((position) => (
						<NativeSelectOption key={position} value={position}>
							{position}
						</NativeSelectOption>
					))}
				</NativeSelect>
			</TableCell>
			<TableCell className={CELL_CLASS}>
				<NativeSelect
					aria-label="Pick"
					size="sm"
					value={entry.pick}
					onChange={(event) =>
						onChange({ pick: event.target.value as AutoSlotEntry["pick"] })
					}
					className={CELL_SELECT_CLASS}
				>
					<NativeSelectOption value="">Default</NativeSelectOption>
					{AUTO_SLOT_PICKS.map((pick) => (
						<NativeSelectOption key={pick} value={pick}>
							{pick}
						</NativeSelectOption>
					))}
				</NativeSelect>
			</TableCell>
			<TableCell className={CELL_CLASS}>
				<Input
					aria-label="Style"
					placeholder="Unchanged"
					title={entry.style}
					value={entry.style}
					onChange={(event) => onChange({ style: event.target.value })}
					className={CELL_INPUT_CLASS}
				/>
			</TableCell>
			<TableCell className={`${CELL_CLASS} text-center`}>
				<Button
					variant="ghost"
					size="icon"
					className="h-6 w-6"
					title="Remove"
					onClick={onRemove}
				>
					<Trash2 className="size-3" />
				</Button>
			</TableCell>
		</TableRow>
		{error && (
			<TableRow>
				<TableCell
					colSpan={COLUMNS.length}
					className="px-1.5 py-1 text-xs whitespace-normal text-destructive"
				>
					{error}
				</TableCell>
			</TableRow>
		)}
	</>
);

export function AutoSlotsPage() {
	const [saved, setSaved] = useState<StoredAutoSlots | null>(null);
	const [entries, setEntries] = useState<AutoSlotEntry[]>([]);
	const [pageInfo, setPageInfo] = useState<PageInfo>({ host: "", slots: [] });
	const [saving, setSaving] = useState(false);
	const importInput = useRef<HTMLInputElement>(null);

	useEffect(() => {
		getPageStorage("localStorage", AUTO_SLOTS_STORAGE_KEY).then((raw) => {
			const stored = parseStoredAutoSlots(raw);
			setSaved(stored);
			setEntries(overridesToEntries(stored.overrides));
		});
		readPageInfo().then(setPageInfo);
	}, []);

	const errors = useMemo(() => validateEntries(entries), [entries]);
	const savedEntries = useMemo(
		() => (saved ? overridesToEntries(saved.overrides) : []),
		[saved],
	);
	const dirty = JSON.stringify(entries) !== JSON.stringify(savedEntries);

	const updateEntry = (index: number, changes: Partial<AutoSlotEntry>) =>
		setEntries((current) =>
			current.map((entry, i) =>
				i === index ? { ...entry, ...changes } : entry,
			),
		);

	// Saves the rows and the switch together, then reloads: the engine reads
	// the overrides once, when the page loads.
	const persist = async (enabled: boolean) => {
		if (errors.size > 0) {
			toast.error("Fix the highlighted slots first");
			return;
		}
		setSaving(true);
		const stored: StoredAutoSlots = {
			enabled,
			overrides: entriesToOverrides(entries),
		};
		const written = await setPageStorage(
			"localStorage",
			AUTO_SLOTS_STORAGE_KEY,
			JSON.stringify(stored),
		);
		setSaving(false);
		if (!written) {
			toast.error("Could not save the overrides on this page");
			return;
		}
		setSaved(stored);
		chrome.devtools.inspectedWindow.reload();
	};

	const overridesScript = () =>
		buildOverridesScript(entriesToOverrides(entries), {
			host: pageInfo.host || "store",
			date: new Date(),
		});

	const handleExport = () => {
		downloadFile(
			overridesScript(),
			overridesScriptFilename(pageInfo.host),
			(message) => toast.success("Download started", { description: message }),
		);
	};

	const handleCopy = async () => {
		try {
			await copyToClipboard(
				overridesScript(),
				(message) => toast.success("Copied!", { description: message }),
				(error) => toast.error("Error", { description: error }),
			);
		} catch (error) {
			console.error("Copy failed:", error);
		}
	};

	// Replaces the rows without saving: "Save and reload" applies them, and
	// "Discard" brings the saved ones back.
	const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		// So choosing the same file again fires a change event.
		event.target.value = "";
		if (!file) return;

		const overrides = parseOverridesScript(await file.text());
		if (!overrides) {
			toast.error("Import Error", {
				description: "The file isn't an exported overrides script or JSON",
			});
			return;
		}
		setEntries(overridesToEntries(overrides));
		toast.success("Imported", { description: `${file.name} is ready to save` });
	};

	const hasOverrides = Object.keys(entriesToOverrides(entries)).length > 0;
	const canExport = hasOverrides && errors.size === 0;

	return (
		<Layout>
			<div className="flex h-full flex-col">
				<nav className="flex items-center justify-between px-1.5 py-1 border-b h-[33px] shrink-0">
					<div className="flex items-center min-w-0">
						<SidebarTrigger />
						<Divider />
						<Button
							disabled={!saved}
							variant="ghost"
							size="icon"
							className="h-6 w-6"
							title="Import an overrides script"
							onClick={() => importInput.current?.click()}
						>
							<UploadIcon className="size-3" />
						</Button>
						<input
							ref={importInput}
							type="file"
							accept=".js,.json,text/javascript,application/json"
							className="hidden"
							onChange={handleImport}
						/>
						<Button
							disabled={!canExport}
							variant="ghost"
							size="icon"
							className="h-6 w-6"
							title="Download the overrides script"
							onClick={handleExport}
						>
							<DownloadIcon className="size-3" />
						</Button>
						<Button
							disabled={!canExport}
							variant="ghost"
							size="icon"
							className="h-6 w-6"
							title="Copy the overrides script"
							onClick={handleCopy}
						>
							<CopyIcon className="size-3" />
						</Button>
						<Divider />
						<LayoutTemplate className="size-3 shrink-0" />
						<span className="ml-1.5 text-xs font-medium">Auto-Slots</span>
						<span className="ml-2 text-xs text-muted-foreground truncate hidden sm:inline">
							Overrides for the auto-slots adapter on this store
						</span>
					</div>
					{saved && (
						<div className="flex items-center gap-3 shrink-0 pr-1">
							<label className="flex items-center gap-1.5 text-xs">
								<Switch
									checked={saved.enabled}
									disabled={saving}
									onCheckedChange={persist}
								/>
								Apply overrides
							</label>
						</div>
					)}
				</nav>
				<div className="flex-1 overflow-y-auto p-4">
					{saved && (
						<div className="w-full space-y-3">
							<p className="text-xs text-muted-foreground">
								Use this to customize slots inserted with the auto-slots
								adapter. You can modify how they are anchored, or apply a CSS to
								tweak positioning. You can also add new slots not present in the
								default bundle.
							</p>
							<datalist id={SLOT_NAMES_LIST_ID}>
								{pageInfo.slots.map((slot) => (
									<option key={slot} value={slot} />
								))}
							</datalist>
							<div className="rounded-md border">
								<Table className="min-w-[880px] table-fixed">
									<TableHeader>
										<TableRow>
											{COLUMNS.map((column) => (
												<TableHead
													key={column.label}
													title={column.title}
													className={`h-7 border-r px-1.5 text-xs last:border-r-0 ${column.className}`}
												>
													{column.label}
												</TableHead>
											))}
										</TableRow>
									</TableHeader>
									<TableBody>
										{entries.map((entry, index) => (
											<EntryRow
												// biome-ignore lint/suspicious/noArrayIndexKey: rows have no id, and are only added at the end or removed
												key={index}
												entry={entry}
												error={errors.get(index)}
												onChange={(changes) => updateEntry(index, changes)}
												onRemove={() =>
													setEntries((current) =>
														current.filter((_, i) => i !== index),
													)
												}
											/>
										))}
										{entries.length === 0 && (
											<TableRow>
												<TableCell
													colSpan={COLUMNS.length}
													className="py-6 text-center text-xs text-muted-foreground"
												>
													No overrides yet. Add a slot, or import a script.
												</TableCell>
											</TableRow>
										)}
									</TableBody>
								</Table>
							</div>
							<div className="flex items-center justify-between gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() =>
										setEntries((current) => [...current, { ...EMPTY_ENTRY }])
									}
								>
									<Plus className="size-3.5" />
									Add slot
								</Button>
								<div className="flex items-center gap-2">
									<Button
										variant="ghost"
										size="sm"
										disabled={!dirty || saving}
										onClick={() => setEntries(savedEntries)}
									>
										Discard
									</Button>
									<Button
										size="sm"
										disabled={!dirty || saving || errors.size > 0}
										// Saving edits means wanting them on the page.
										onClick={() => persist(true)}
									>
										Save and reload
									</Button>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</Layout>
	);
}
