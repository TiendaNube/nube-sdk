import { CopyableValue } from "@/components/copyable-value";
import type { NubeSDKEvent } from "@/contexts/nube-sdk-apps-context";
import { useOptionalNubeSDKAppsMetadata } from "@/contexts/nube-sdk-apps-metadata-context";
import { formatAppLabel } from "@/utils/apps-metadata";
import {
	Building2,
	CalendarClock,
	CalendarPlus,
	Download,
	GitCommitVertical,
	Globe,
	Hash,
	MapPin,
	Plug,
	ShieldCheck,
	Tag,
	TerminalSquare,
} from "lucide-react";
import {
	BlockedBadge,
	HostedAppBadge,
	LocalModeBadge,
	ReplacedScriptBadge,
} from "./app-badges";
import { AppDetailRow } from "./app-detail-row";
import { AppDetailSection } from "./app-detail-section";
import { type ScriptStatus, getScriptStatusLabel } from "./app-status";
import { StatusDot } from "./status-badge";
import { TemporaryBlockCard } from "./temporary-block-card";

type AppDetailPanelProps = {
	app: NubeSDKEvent;
	scriptStatus?: ScriptStatus;
	isLocalMode: boolean;
	isReplacedScript: boolean;
	isBlocked: boolean;
	onBlockedChange: (blocked: boolean) => void;
};

export function AppDetailPanel({
	app,
	scriptStatus,
	isLocalMode,
	isReplacedScript,
	isBlocked,
	onBlockedChange,
}: AppDetailPanelProps) {
	const { id, registered, script } = app.data;
	const effectiveStatus = isBlocked ? "offline" : scriptStatus;
	const metadata = useOptionalNubeSDKAppsMetadata()?.getAppMetadata(id);
	const label = formatAppLabel(metadata);
	// The store lists the script it serves; local mode or a stale page can
	// load another one under the same app id.
	const isOtherScriptThanStore = metadata
		? metadata.script.src !== script
		: false;

	return (
		<div className="flex h-full flex-col overflow-hidden">
			<header className="shrink-0 border-b p-1.5">
				<div className="flex items-center gap-2 px-1.5">
					<StatusDot status={effectiveStatus} />
					<span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
						{isLocalMode ? "Local app" : "Installed app"}
					</span>
				</div>
				{label && (
					<div
						className="truncate px-1.5 pt-1 text-[13px] font-medium"
						title={label}
					>
						{label}
					</div>
				)}
				<CopyableValue
					value={id}
					fontSize={label ? "text-[11px]" : "text-[13px]"}
				/>
				<div className="mt-0.5 flex flex-wrap items-center gap-1 px-1.5">
					{isLocalMode ? <LocalModeBadge /> : <HostedAppBadge />}
					{isReplacedScript && <ReplacedScriptBadge />}
					{isBlocked && <BlockedBadge />}
				</div>
			</header>

			<div className="flex-1 space-y-3 overflow-y-auto p-2">
				<AppDetailSection title="Overview">
					<AppDetailRow
						label="Connection"
						icon={Plug}
						value={
							isBlocked
								? "blocked"
								: scriptStatus
									? getScriptStatusLabel(scriptStatus)
									: "unknown"
						}
						tone={
							isBlocked
								? "danger"
								: effectiveStatus === "online"
									? "success"
									: effectiveStatus === "offline"
										? "danger"
										: "muted"
						}
					/>
					<AppDetailRow
						label="Mode"
						icon={isLocalMode ? TerminalSquare : Globe}
						value={isLocalMode ? "Local Mode" : "Hosted"}
						tone={isLocalMode ? "info" : "neutral"}
					/>
					<AppDetailRow
						label="Registered"
						icon={ShieldCheck}
						value={registered ? "yes" : "no"}
						tone={registered ? "success" : "danger"}
					/>
				</AppDetailSection>

				{metadata && (
					<AppDetailSection title="App">
						<AppDetailRow
							label="Name"
							icon={Tag}
							value={metadata.app.name ?? "—"}
							tone={metadata.app.name ? "neutral" : "muted"}
						/>
						<AppDetailRow
							label="Handle"
							icon={Hash}
							value={metadata.app.handle ?? "—"}
							tone={metadata.app.handle ? "neutral" : "muted"}
						/>
						<AppDetailRow
							label="Installed"
							icon={Download}
							value={<DateValue value={metadata.app.installed_at} />}
						/>
					</AppDetailSection>
				)}

				{metadata && (
					<AppDetailSection title="Partner">
						<AppDetailRow
							label="Name"
							icon={Building2}
							value={metadata.partner.name ?? "—"}
							tone={metadata.partner.name ? "neutral" : "muted"}
						/>
						<AppDetailRow
							label="Id"
							icon={Hash}
							value={metadata.partner.id ?? "—"}
							tone={metadata.partner.id !== null ? "neutral" : "muted"}
						/>
					</AppDetailSection>
				)}

				<AppDetailSection title="Script">
					<div className="p-0.5">
						<CopyableValue value={script} />
					</div>
					{metadata && (
						<>
							{isOtherScriptThanStore && (
								<div className="px-3 py-2 text-[11px] text-amber-500">
									The page loaded another script than the one the store serves
									for this app:
									<div className="mt-1 break-all font-mono text-muted-foreground">
										{metadata.script.src}
									</div>
								</div>
							)}
							<AppDetailRow
								label="Script id"
								icon={Hash}
								value={metadata.script.id}
							/>
							<AppDetailRow
								label="Version"
								icon={GitCommitVertical}
								value={
									metadata.script.version !== null
										? `v${metadata.script.version}`
										: "—"
								}
								tone={metadata.script.version !== null ? "neutral" : "muted"}
							/>
							<AppDetailRow
								label="Version activated"
								icon={CalendarClock}
								value={
									<DateValue value={metadata.script.version_activated_at} />
								}
							/>
							<AppDetailRow
								label="Created"
								icon={CalendarPlus}
								value={<DateValue value={metadata.script.created_at} />}
							/>
							<AppDetailRow
								label="Updated"
								icon={CalendarClock}
								value={<DateValue value={metadata.script.updated_at} />}
							/>
							<AppDetailRow
								label="Location"
								icon={MapPin}
								value={metadata.script.location}
							/>
						</>
					)}
				</AppDetailSection>

				<AppDetailSection title="Controls">
					{isLocalMode ? (
						<div className="flex items-center gap-3 p-3">
							<div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground">
								<TerminalSquare className="size-3.5" />
							</div>
							<div className="flex flex-col gap-0.5">
								<span className="text-xs font-medium">
									Temporary block unavailable
								</span>
								<span className="text-[11px] text-muted-foreground">
									Local mode apps can't be blocked. Stop your local dev server
									to disable this app.
								</span>
							</div>
						</div>
					) : (
						<TemporaryBlockCard
							blocked={isBlocked}
							onBlockedChange={onBlockedChange}
						/>
					)}
				</AppDetailSection>
			</div>
		</div>
	);
}

/** A store date (ISO 8601) in the panel's locale, the raw value as tooltip. */
function DateValue({ value }: { value: string | null }) {
	if (!value) return <span className="text-muted-foreground">—</span>;

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return <span>{value}</span>;

	return <span title={value}>{date.toLocaleString()}</span>;
}
