import { CopyableValue } from "@/components/copyable-value";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Circle, XCircle } from "lucide-react";

export type ScriptStatus = "checking" | "online" | "offline";

export const getScriptStatusLabel = (status: ScriptStatus) => {
	switch (status) {
		case "checking":
			return "checking...";
		case "online":
			return "online";
		case "offline":
			return "offline";
	}
};

export const getScriptStatusColor = (status: ScriptStatus) => {
	switch (status) {
		case "checking":
			return "text-muted-foreground";
		case "online":
			return "text-emerald-400/70";
		case "offline":
			return "text-rose-400/70";
	}
};

type AppDetailPanelProps = {
	id: string;
	registered: boolean;
	script: string;
	scriptStatus?: ScriptStatus;
};

export function AppDetailPanel({
	id,
	registered,
	script,
	scriptStatus,
}: AppDetailPanelProps) {
	return (
		<div className="flex flex-col p-4">
			<div className="space-y-2">
				<DetailField
					label="ID"
					trailing={
						<Badge
							variant="outline"
							className={`text-[10px] px-1.5 py-0 gap-1 ${registered ? "text-emerald-400/70" : "text-rose-400/70"}`}
						>
							{registered ? (
								<CheckCircle2 className="h-1.5 w-1.5" />
							) : (
								<XCircle className="h-1.5 w-1.5" />
							)}
							{registered ? "registered" : "unregistered"}
						</Badge>
					}
				>
					<CopyableValue value={id} />
				</DetailField>

				<Separator />

				<DetailField
					label="Script"
					trailing={
						scriptStatus && (
							<Badge
								variant="outline"
								className={`text-[10px] px-1.5 py-0 gap-1 ${getScriptStatusColor(scriptStatus)}`}
							>
								<Circle className="h-1.5 w-1.5 fill-current" />
								{getScriptStatusLabel(scriptStatus)}
							</Badge>
						)
					}
				>
					<CopyableValue value={script} />
				</DetailField>
			</div>
		</div>
	);
}

function DetailField({
	label,
	trailing,
	children,
}: {
	label: string;
	trailing?: React.ReactNode;
	children: React.ReactNode;
}) {
	return (
		<div className="space-y-1.5">
			<div className="flex items-center justify-between">
				<Label className="text-xs text-muted-foreground uppercase tracking-wider">
					{label}
				</Label>
				{trailing}
			</div>
			{children}
		</div>
	);
}
