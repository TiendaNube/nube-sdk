import { CopyableValue } from "@/components/copyable-value";
import { Label } from "@/components/ui/label";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type AppDetailFieldProps = {
	label: string;
	icon: LucideIcon;
	value: string;
	trailing?: ReactNode;
};

export function AppDetailField({
	label,
	icon: Icon,
	value,
	trailing,
}: AppDetailFieldProps) {
	return (
		<div className="space-y-1.5">
			<div className="flex items-center justify-between">
				<Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
					{label}
				</Label>
				{trailing}
			</div>
			<div className="flex items-center gap-2 rounded-xl border bg-card/40 pl-2.5">
				<Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
				<div className="min-w-0 flex-1">
					<CopyableValue value={value} />
				</div>
			</div>
		</div>
	);
}
