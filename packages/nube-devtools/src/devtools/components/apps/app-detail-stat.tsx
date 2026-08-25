import type { LucideIcon } from "lucide-react";

type AppDetailStatProps = {
	icon: LucideIcon;
	label: string;
	value: string;
	description: string;
	tone?: "neutral" | "info" | "success" | "danger";
};

const TONE_CLASSES = {
	neutral: "text-foreground",
	info: "text-sky-400",
	success: "text-emerald-400",
	danger: "text-rose-400",
} as const;

export function AppDetailStat({
	icon: Icon,
	label,
	value,
	description,
	tone = "neutral",
}: AppDetailStatProps) {
	const toneClass = TONE_CLASSES[tone];

	return (
		<div className="flex-1 rounded-xl border bg-card/40 p-3">
			<div className="flex items-center gap-1.5">
				<Icon className={`h-3.5 w-3.5 ${toneClass}`} />
				<span className="text-[10px] uppercase tracking-wider text-muted-foreground">
					{label}
				</span>
			</div>
			<p className={`mt-2 text-sm font-medium ${toneClass}`}>{value}</p>
			<p className="text-xs text-muted-foreground">{description}</p>
		</div>
	);
}
