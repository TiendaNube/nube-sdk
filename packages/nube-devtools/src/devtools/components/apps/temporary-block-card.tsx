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
		<div className="flex items-center gap-3 px-3 py-2.5">
			<div
				className={`flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors ${
					blocked
						? "bg-rose-400/10 text-rose-400"
						: "bg-muted/60 text-muted-foreground"
				}`}
			>
				<BanIcon className="size-3.5" />
			</div>
			<div className="min-w-0 flex-1">
				<p className="text-xs font-medium">Temporary block</p>
				<p className="mt-0.5 text-[11px] text-muted-foreground">
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
