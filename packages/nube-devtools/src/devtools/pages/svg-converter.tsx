import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useDevToolsTheme } from "@/contexts/devtools-theme-context";
import Layout from "@/devtools/components/layout";
import { Copy, Download } from "lucide-react";
import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
	oneDark,
	oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { toast } from "sonner";
import { convertSvgToNubeSDK, copyToClipboard, downloadFile } from "@/utils";
import { useDynamicWidth } from "@/devtools/hooks";

export function SvgConverter() {
	const [inputSvg, setInputSvg] = useState<string>("");
	const [outputCode, setOutputCode] = useState<string>("");
	const { theme } = useDevToolsTheme();
	const isDarkMode = theme === "dark";
	const { width, containerRef } = useDynamicWidth();

	const handleSvgConversion = (svgString: string) => {
		try {
			const convertedCode = convertSvgToNubeSDK(svgString);
			setOutputCode(convertedCode);
		} catch (error) {
			toast.error("Conversion Error", {
				description: "Please check if the SVG is in valid format",
			});
		}
	};

	const handleCopy = async () => {
		await copyToClipboard(
			outputCode,
			(message) => toast.success("Copied!", { description: message }),
			(error) => toast.error("Error", { description: error })
		);
	};

	const handleDownload = () => {
		downloadFile(
			outputCode,
			"SvgComponent.tsx",
			(message) => toast.success("Download started", { description: message })
		);
	};

	return (
		<Layout>
			<div className="flex h-full flex-col max-w-full overflow-hidden">
				<nav className="flex items-center px-1.5 justify-between py-1 border-b h-[33px] shrink-0">
					<div className="flex items-center">
						<SidebarTrigger />
					</div>
				</nav>
				<Card className="mt-4 ml-4 mr-4">
					<CardContent>
						<div className="flex flex-col md:flex-row gap-4 text-sm">
							<div className="flex items-start gap-3">
								<div className="w-6 h-6 rounded-full flex items-center justify-center font-semibold text-xs bg-blue-100 text-blue-600">
									1
								</div>
								<div>
									<h4 className="font-semibold mb-1">Paste SVG</h4>
									<p className="text-gray-500 text-xs">
										Paste the SVG code in the left panel
									</p>
								</div>
							</div>
							<div className="flex items-start gap-3">
								<div className="w-6 h-6 rounded-full flex items-center justify-center font-semibold text-xs bg-blue-100 text-blue-600">
									2
								</div>
								<div>
									<h4 className="font-semibold mb-1">Automatic conversion</h4>
									<p className="text-gray-500 text-xs">
										The code will be automatically converted to NubeSDK
									</p>
								</div>
							</div>
							<div className="flex items-start gap-3">
								<div className="w-6 h-6 rounded-full flex items-center justify-center font-semibold text-xs bg-blue-100 text-blue-600">
									3
								</div>
								<div>
									<h4 className="font-semibold mb-1">Copy or download</h4>
									<p className="text-gray-500 text-xs">
										Use the buttons to copy or download the converted code
									</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
				<div className="h-full flex">
					<div className="w-1/2 p-4 h-full flex flex-col">
						<div className="flex-1 overflow-hidden">
							<textarea
								value={inputSvg}
								onChange={(e) => {
									setInputSvg(e.target.value);
									handleSvgConversion(e.target.value);
								}}
								placeholder="Paste your SVG code here..."
								className="h-full p-3 border rounded-md font-mono text-sm resize-none overflow-auto"
								style={{
									minHeight: "100%",
									maxHeight: "100%",
									maxWidth: "100%",
									minWidth: "100%",
								}}
							/>
						</div>
					</div>
					<div className="flex-1 p-4 flex flex-col min-w-0" ref={containerRef}>
						<div className="flex-1 border rounded-md relative overflow-hidden">
							{outputCode && (
								<div className="flex gap-2 absolute top-2 right-2 z-10">
									<Button size="icon" onClick={handleCopy}>
										<Copy />
									</Button>
									<Button size="icon" onClick={handleDownload}>
										<Download />
									</Button>
								</div>
							)}
							<div
								className="h-full"
								style={{
									scrollbarWidth: "thin",
									scrollbarColor: isDarkMode
										? "#090909 #141414"
										: "#f8f9fa #f8f9fa",
								}}
							>
								<SyntaxHighlighter
									language="tsx"
									style={isDarkMode ? oneDark : oneLight}
									customStyle={{
										margin: 0,
										height: "100%",
										width: width > 0 ? `${width - 32}px` : "100%",
										fontSize: "14px",
										lineHeight: "1.5",
										padding: "12px",
										backgroundColor: isDarkMode ? "#1e1e1e" : "#f8f9fa",
										border: "none",
										wordWrap: "break-word",
										whiteSpace: "pre-wrap",
										wordBreak: "break-all",
										overflowWrap: "break-word",
										boxSizing: "border-box",
									}}
									showLineNumbers={true}
									wrapLines={true}
									wrapLongLines={true}
									className="custom-scrollbar"
								>
									{outputCode || "// Converted code will appear here..."}
								</SyntaxHighlighter>
							</div>
						</div>
					</div>
				</div>
			</div>
		</Layout>
	);
}
