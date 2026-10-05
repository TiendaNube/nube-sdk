import { Copy } from "lucide-react";
import { useCallback } from "react";
import { toast } from "sonner";

const EXAMPLE_URL = "http://localhost:8081/main.min.js";

export function LocalModeQuickTips() {
	const handleCopyUrl = useCallback(() => {
		navigator.clipboard.writeText(EXAMPLE_URL).then(() => {
			toast.success("Copied to clipboard");
		});
	}, []);

	return (
		<div className="mt-2 space-y-1 pb-4">
			<h3 className="text-[11px] font-medium text-muted-foreground">
				Quick Tips
			</h3>
			<div className="space-y-1">
				<div className="flex items-start gap-1.5 p-1.5 rounded-md bg-card border border-border">
					<span className="text-[11px] font-mono text-secondary-foreground shrink-0 w-3">
						1.
					</span>
					<p className="text-[11px] text-muted-foreground">
						Run{" "}
						<code className="bg-secondary px-1 py-0.5 rounded font-mono text-[10px]">
							npm run dev
						</code>{" "}
						in your NubeSDK app
					</p>
				</div>
				<div className="flex items-start gap-1.5 p-1.5 rounded-md bg-card border border-border">
					<span className="text-[11px] font-mono text-secondary-foreground shrink-0 w-3">
						2.
					</span>
					<p className="text-[11px] text-muted-foreground">
						Copy URL (e.g.{" "}
						<code className="bg-secondary px-0 py-0.5 rounded font-mono text-[10px]">
							{EXAMPLE_URL}
						</code>
						)
						<button
							type="button"
							onClick={handleCopyUrl}
							title="Copy URL"
							aria-label="Copy URL"
							className="ml-1 inline-flex items-center align-middle text-muted-foreground transition-colors hover:text-foreground"
						>
							<Copy className="h-3 w-3" />
						</button>
					</p>
				</div>
				<div className="flex items-start gap-1.5 p-1.5 rounded-md bg-card border border-border">
					<span className="text-[11px] font-mono text-secondary-foreground shrink-0 w-3">
						3.
					</span>
					<p className="text-[11px] text-muted-foreground">
						Paste above and click Start Application
					</p>
				</div>
			</div>
		</div>
	);
}
