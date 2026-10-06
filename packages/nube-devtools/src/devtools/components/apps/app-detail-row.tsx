import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

const TONE_CLASSES = {
	neutral: "text-foreground",
	muted: "text-muted-foreground",
	info: "text-sky-400",
	success: "text-emerald-400",
	danger: "text-rose-400",
} as const;

type AppDetailRowProps = {
	label: string;
	icon?: LucideIcon;
	value?: ReactNode;
	tone?: keyof typeof TONE_CLASSES;
};

export function AppDetailRow({
	label,
	icon: Icon,
	value,
	tone = "neutral",
}: AppDetailRowProps) {
	return (
		<div className="flex items-center justify-between gap-3 px-3 py-2">
			<span className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
				{Icon && <Icon className="size-3.5 shrink-0" />}
				{label}
			</span>
			<span className={`truncate text-xs font-medium ${TONE_CLASSES[tone]}`}>
				{value}
			</span>
		</div>
	);
}
