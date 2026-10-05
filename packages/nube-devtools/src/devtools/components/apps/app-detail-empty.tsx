import { AppWindow } from "lucide-react";

export function AppDetailEmpty() {
	return (
		<div className="flex h-full flex-col items-center justify-center gap-2.5 p-4 text-center">
			<div className="flex size-9 items-center justify-center rounded-xl border bg-card/40">
				<AppWindow className="size-4 text-muted-foreground" />
			</div>
			<p className="text-xs text-muted-foreground">
				Select an app to see its details
			</p>
		</div>
	);
}
