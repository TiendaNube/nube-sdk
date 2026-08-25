import { Switch } from "@/components/ui/switch";
import { BanIcon } from "lucide-react";

type TemporaryBlockCardProps = {
	blocked: boolean;
	onBlockedChange: (blocked: boolean) => void;
};

export function TemporaryBlockCard({
	blocked,
	onBlockedChange,
}: TemporaryBlockCardProps) {
	return (
		<div className="flex items-center gap-3 rounded-xl border bg-card/40 p-3">
			<div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/60">
				<BanIcon className="h-4 w-4 text-muted-foreground" />
			</div>
			<div className="min-w-0 flex-1">
				<p className="text-sm font-medium">Temporary block</p>
				<p className="text-xs text-muted-foreground">
					Pause this app without uninstalling it.
				</p>
			</div>
			<Switch
				checked={blocked}
				onCheckedChange={onBlockedChange}
				aria-label="Temporary block"
			/>
		</div>
	);
}
