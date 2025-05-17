import { useDevToolsTheme } from "@/contexts/devtools-theme-context";
import ReactJsonView from "@microlink/react-json-view";

interface JsonViewerProps {
	data: object;
	className?: string;
}

export function JsonViewer({ data, className }: JsonViewerProps) {
	const { theme } = useDevToolsTheme();

	return (
		<div className={className}>
			<ReactJsonView
				src={data}
				theme={theme === "dark" ? "monokai" : "rjv-default"}
				collapsed={2}
				displayDataTypes={false}
				iconStyle="triangle"
				enableClipboard={false}
				style={{
					backgroundColor: "transparent",
					fontSize: "12px",
				}}
			/>
		</div>
	);
}
