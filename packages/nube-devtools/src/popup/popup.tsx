import { LocalModeContent } from "@/components/local-mode-content";
import { Badge } from "@/components/ui/badge";
import { Terminal } from "lucide-react";
import { PopupFooter } from "./components/popup-footer";

export function Popup() {
	return (
		<div className="h-full min-h-0 bg-background flex flex-col">
			{/* Header */}
			<header className="shrink-0 border-b border-border px-3 py-2">
				<div className="flex items-center gap-2">
					<div className="flex items-center justify-center w-6 h-6 rounded-md bg-accent">
						<Terminal className="w-3.5 h-3.5 text-accent-foreground" />
					</div>
					<span className="font-semibold text-sm text-foreground">NubeSDK</span>
					<Badge variant="secondary" className="text-[10px] px-1.5 py-0">
						DevTools
					</Badge>
				</div>
			</header>

			<main className="flex-1 flex justify-center p-3">
				<LocalModeContent />
			</main>

			<PopupFooter />
		</div>
	);
}
