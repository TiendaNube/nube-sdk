import packageData from "../../../package.json";

export function PopupFooter() {
	return (
		<footer className="shrink-0 border-t border-border px-3 py-1.5">
			<div className="flex items-center justify-between text-[10px] text-muted-foreground">
				<span>NubeSDK DevTools v{packageData.version}</span>
				<a
					href="https://dev.nuvemshop.com.br/docs/applications/nube-sdk/overview"
					target="_blank"
					className="hover:text-foreground transition-colors truncate ml-2"
					rel="noreferrer"
				>
					Docs
				</a>
			</div>
		</footer>
	);
}
