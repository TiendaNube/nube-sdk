import { CopyableValue } from "@/components/copyable-value";
import { Button } from "@/components/ui/button";
import type { NubeSDKEvent } from "@/contexts/nube-sdk-apps-context";
import type { AppRendering } from "@/utils/app-rendering";
import { stopLocalModeApp } from "@/utils/local-mode";
import {
	Globe,
	LayoutGrid,
	Plug,
	ShieldCheck,
	Square,
	TerminalSquare,
	Zap,
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
	/** What the app renders right now; undefined until the page is read. */
	rendering?: AppRendering;
};

export function AppDetailPanel({
	app,
	scriptStatus,
	isLocalMode,
	isReplacedScript,
	isBlocked,
	onBlockedChange,
	rendering,
}: AppDetailPanelProps) {
	const { id, registered, script } = app.data;
	const effectiveStatus = isBlocked ? "offline" : scriptStatus;

	return (
		<div className="flex h-full flex-col overflow-hidden">
			<header className="shrink-0 border-b p-1.5">
				<div className="flex items-center gap-2 px-1.5">
					<StatusDot status={effectiveStatus} />
					<span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
						{isLocalMode ? "Local app" : "Installed app"}
					</span>
				</div>
				<CopyableValue value={id} fontSize="text-[13px]" />
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

				<AppDetailSection title="Rendering">
					<AppDetailRow
						label="Slots in use"
						icon={LayoutGrid}
						value={rendering?.slots.length ? rendering.slots.length : "none"}
						tone={rendering?.slots.length ? "neutral" : "muted"}
					/>
					{rendering && rendering.slots.length > 0 && (
						<div className="flex flex-wrap gap-1 px-3 py-2">
							{rendering.slots.map((slot) => (
								<span
									key={slot}
									className="rounded border bg-muted/40 px-1.5 py-0.5 font-mono text-[11px]"
								>
									{slot}
								</span>
							))}
						</div>
					)}
					<AppDetailRow
						label="Signals"
						icon={Zap}
						value={
							rendering?.signals ? `yes · ${rendering.signals} rendered` : "no"
						}
						tone={rendering?.signals ? "info" : "muted"}
					/>
				</AppDetailSection>

				<AppDetailSection title="Script">
					<div className="p-0.5">
						<CopyableValue value={script} />
					</div>
				</AppDetailSection>

				<AppDetailSection title="Controls">
					{isLocalMode ? (
						<div className="p-3">
							<Button
								onClick={() => void stopLocalModeApp()}
								variant="destructive"
								className="w-full text-xs font-medium cursor-pointer"
								size="sm"
							>
								<Square />
								Stop App
							</Button>
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
