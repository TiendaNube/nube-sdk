type LocalModeQuickTipsProps = {
	defaultUrl: string;
};

export function LocalModeQuickTips({ defaultUrl }: LocalModeQuickTipsProps) {
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
						Click Start App. If the URL field is empty,{" "}
						<code className="bg-secondary px-0 py-0.5 rounded font-mono text-[10px]">
							{defaultUrl}
						</code>{" "}
						is used
					</p>
				</div>
				<div className="flex items-start gap-1.5 p-1.5 rounded-md bg-card border border-border">
					<span className="text-[11px] font-mono text-secondary-foreground shrink-0 w-3">
						3.
					</span>
					<p className="text-[11px] text-muted-foreground">
						Using a different port or path? Paste your URL above before starting
					</p>
				</div>
			</div>
		</div>
	);
}
