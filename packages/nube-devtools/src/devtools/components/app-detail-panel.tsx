import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Circle, Copy, XCircle } from "lucide-react";
import { useCallback } from "react";
import { toast } from "sonner";

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

function CopyableValue({ value }: { value: string }) {
	const handleCopy = useCallback(() => {
		navigator.clipboard.writeText(value).then(() => {
			toast.success("Copied to clipboard");
		});
	}, [value]);

	return (
		<button
			type="button"
			onClick={handleCopy}
			className="group/copy flex w-full items-center gap-2 rounded-md border border-transparent px-2.5 py-1.5 text-left text-sm transition-colors hover:border-border hover:bg-muted/50"
		>
			<span className="min-w-0 flex-1 break-all font-mono text-xs">
				{value}
			</span>
			<span className="shrink-0 opacity-0 transition-opacity group-hover/copy:opacity-100">
				<Copy className="h-3.5 w-3.5 text-muted-foreground" />
			</span>
		</button>
	);
}

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
		<div className="flex h-full flex-col">
			<div className="flex items-center gap-2 border-b px-4 py-2.5">
				<span className="truncate text-sm font-semibold">{id}</span>
				<Badge
					variant={registered ? "default" : "secondary"}
					className="shrink-0 text-[10px]"
				>
					{registered ? "registered" : "unregistered"}
				</Badge>
			</div>

			<div className="flex-1 overflow-y-auto p-4">
				<div className="space-y-2">
					<DetailField label="ID">
						<CopyableValue value={id} />
					</DetailField>

					<Separator />

					<DetailField label="Registered">
						<div className="flex items-center gap-2 px-2.5 py-1.5">
							{registered ? (
								<CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
							) : (
								<XCircle className="h-3.5 w-3.5 text-rose-400" />
							)}
							<span className="text-xs font-mono">
								{registered ? "true" : "false"}
							</span>
						</div>
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
