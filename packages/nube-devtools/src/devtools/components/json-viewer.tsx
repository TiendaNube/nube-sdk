import { useDevToolsTheme } from "@/contexts/devtools-theme-context";
import ReactJsonView from "@microlink/react-json-view";

interface JsonViewerProps {
	data: object;
	className?: string;
	collapsed?: number;
}

export function JsonViewer({
	data,
	className,
	collapsed = 2,
}: JsonViewerProps) {
	const { theme } = useDevToolsTheme();

	return (
		<div className={className}>
			<ReactJsonView
				src={data}
				theme={theme === "dark" ? "monokai" : "rjv-default"}
				collapsed={collapsed}
				displayDataTypes={false}
				iconStyle="circle"
				enableClipboard={false}
				style={{
					backgroundColor: "transparent",
				}}
			/>
		</div>
	);
}
