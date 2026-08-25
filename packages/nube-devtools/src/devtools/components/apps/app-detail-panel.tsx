import { Badge } from "@/components/ui/badge";
import type { NubeSDKEvent } from "@/contexts/nube-sdk-apps-context";
import {
	CheckCircle2,
	FileCode2,
	Globe,
	Hash,
	TerminalSquare,
	XCircle,
} from "lucide-react";
import { BlockedBadge, LocalModeBadge, RemoteAppBadge } from "./app-badges";
import { AppDetailField } from "./app-detail-field";
import { AppDetailStat } from "./app-detail-stat";
import type { ScriptStatus } from "./app-status";
import { ScriptStatusBadge } from "./status-badge";
import { TemporaryBlockCard } from "./temporary-block-card";

type AppDetailPanelProps = {
	app: NubeSDKEvent;
	scriptStatus?: ScriptStatus;
	isLocalMode: boolean;
	isBlocked: boolean;
	onBlockedChange: (blocked: boolean) => void;
};

export function AppDetailPanel({
	app,
	scriptStatus,
	isLocalMode,
	isBlocked,
	onBlockedChange,
}: AppDetailPanelProps) {
	const { id, registered, script } = app.data;
	const isOnline = scriptStatus === "online";

	return (
		<div className="flex h-full flex-col overflow-hidden">
			<header className="shrink-0 border-b px-4 py-3">
				<div className="flex items-start justify-between gap-2">
					<span className="text-[10px] uppercase tracking-wider text-muted-foreground">
						Installed app
					</span>
					<div className="flex shrink-0 items-center gap-1.5">
						{isLocalMode ? <LocalModeBadge /> : <RemoteAppBadge />}
						{isBlocked ? (
							<BlockedBadge />
						) : (
							<ScriptStatusBadge status={scriptStatus} />
						)}
					</div>
				</div>
				<h1 className="mt-1 truncate font-mono text-sm font-semibold">{id}</h1>
			</header>

			<div className="flex-1 space-y-3 overflow-y-auto p-4">
				<TemporaryBlockCard
					blocked={isBlocked}
					onBlockedChange={onBlockedChange}
				/>

				<div className="flex gap-3">
					<AppDetailStat
						icon={isLocalMode ? TerminalSquare : Globe}
						label="Mode"
						value={isLocalMode ? "Local Mode" : "App"}
						description={isLocalMode ? "Served via DevTools" : "Installed app"}
						tone={isLocalMode ? "info" : "neutral"}
					/>
					<AppDetailStat
						icon={isOnline ? CheckCircle2 : XCircle}
						label="Connection"
						value={isOnline ? "Online" : "Offline"}
						description={
							isOnline ? "Responding to events" : "Not responding to events"
						}
						tone={isOnline ? "success" : "danger"}
					/>
				</div>

				<AppDetailField
					label="ID"
					icon={Hash}
					value={id}
					trailing={<RegisteredBadge registered={registered} />}
				/>

				<AppDetailField
					label="Script"
					icon={FileCode2}
					value={script}
					trailing={<ScriptStatusBadge status={scriptStatus} />}
				/>
			</div>
		</div>
	);
}

function RegisteredBadge({ registered }: { registered: boolean }) {
	return (
		<Badge
			variant="outline"
			className={`gap-1 px-1.5 py-0 text-[10px] ${
				registered ? "text-emerald-400/70" : "text-rose-400/70"
			}`}
		>
			{registered ? (
				<CheckCircle2 className="h-1.5 w-1.5" />
			) : (
				<XCircle className="h-1.5 w-1.5" />
			)}
			{registered ? "registered" : "unregistered"}
		</Badge>
	);
}
