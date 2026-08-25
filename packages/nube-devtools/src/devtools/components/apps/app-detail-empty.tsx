import { AppWindow } from "lucide-react";

export function AppDetailEmpty() {
	return (
		<div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
			<AppWindow className="h-5 w-5 text-muted-foreground" />
			<p className="text-xs text-muted-foreground">
				Select an app to see its details
			</p>
		</div>
	);
}
