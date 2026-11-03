import { Badge } from "@/components/ui/badge";
import { TerminalSquare } from "lucide-react";

/**
 * Marks a row produced by the app Local Mode injected. What that app does on
 * the page comes from the developer's machine, not from the store, so a
 * surprise in its events or logs is theirs to look into first.
 */
export function LocalModeBadge() {
	return (
		<Badge
			variant="outline"
			className="h-4 shrink-0 gap-1 rounded px-1 py-0 text-[10px] font-normal border-sky-400/30 bg-sky-400/5 text-sky-500 dark:text-sky-400"
			title="Produced by the app served from your local dev server"
		>
			<TerminalSquare className="size-2.5" />
			local
		</Badge>
	);
}
