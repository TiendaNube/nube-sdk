import type { ReactNode } from "react";

type AppDetailSectionProps = {
	title: string;
	action?: ReactNode;
	children: ReactNode;
};

export function AppDetailSection({
	title,
	action,
	children,
}: AppDetailSectionProps) {
	return (
		<section className="space-y-1.5">
			<div className="flex items-center justify-between gap-2 px-1">
				<h2 className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
					{title}
				</h2>
				{action}
			</div>
			<div className="divide-y divide-border/50 overflow-hidden rounded-xl border bg-card/40">
				{children}
			</div>
		</section>
	);
}
