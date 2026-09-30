import { CopyableValue } from "@/components/copyable-value";
import type { NubeSDKEvent } from "@/contexts/nube-sdk-apps-context";
import { Globe, Plug, ShieldCheck, TerminalSquare } from "lucide-react";
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

				<AppDetailSection title="Script">
					<div className="p-0.5">
						<CopyableValue value={script} />
					</div>
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
