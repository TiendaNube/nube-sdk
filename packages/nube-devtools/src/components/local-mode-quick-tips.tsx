export function LocalModeQuickTips() {
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
						<code className="bg-secondary px-1 py-0.5 rounded font-mono text-[10px]">
							http://localhost:8081/main.min.js
						</code>
						)
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
