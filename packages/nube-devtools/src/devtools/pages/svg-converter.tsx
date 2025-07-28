import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useDevToolsTheme } from "@/contexts/devtools-theme-context";
import Layout from "@/devtools/components/layout";
import { Copy, Download, RefreshCw, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
	oneDark,
	oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { toast } from "sonner";

// Hook personalizado para calcular largura dinamicamente
const useDynamicWidth = () => {
	const [width, setWidth] = useState<number>(0);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const updateWidth = () => {
			if (containerRef.current) {
				const rect = containerRef.current.getBoundingClientRect();
				setWidth(rect.width);
			}
		};

		// Atualiza a largura inicial
		updateWidth();

		// Adiciona listener para mudanças de tamanho
		const resizeObserver = new ResizeObserver(updateWidth);
		if (containerRef.current) {
			resizeObserver.observe(containerRef.current);
		}

		// Listener para mudanças de tamanho da janela
		window.addEventListener("resize", updateWidth);

		return () => {
			resizeObserver.disconnect();
			window.removeEventListener("resize", updateWidth);
		};
	}, []);

	return { width, containerRef };
};

export function SvgConverter() {
	const [inputSvg, setInputSvg] = useState<string>("");
	const [outputCode, setOutputCode] = useState<string>("");
	const { theme } = useDevToolsTheme();
	const isDarkMode = theme === "dark";
	const { width, containerRef } = useDynamicWidth();

	const convertSvgToNubeSDK = (svgString: string) => {
		const trimmedSvg = svgString.trim();
		if (!trimmedSvg) {
			setOutputCode("");
			return;
		}

		try {
			let converted = trimmedSvg.replace(/<!--[\s\S]*?-->/g, "");

			// Remove o atributo class de todas as tags
			converted = converted.replace(/\s+class\s*=\s*["'][^"']*["']/g, "");

			const tagMappings = {
				"<svg": "<Svg.Root",
				"</svg>": "</Svg.Root>",
				"<g": "<Svg.G",
				"</g>": "</Svg.G>",
				"<path": "<Svg.Path",
				"</path>": "</Svg.Path>",
				"<circle": "<Svg.Circle",
				"</circle>": "</Svg.Circle>",
				"<rect": "<Svg.Rect",
				"</rect>": "</Svg.Rect>",
				"<line": "<Svg.Line",
				"</line>": "</Svg.Line>",
				"<polyline": "<Svg.Polyline",
				"</polyline>": "</Svg.Polyline>",
				"<polygon": "<Svg.Polygon",
				"</polygon>": "</Svg.Polygon>",
				"<ellipse": "<Svg.Ellipse",
				"</ellipse>": "</Svg.Ellipse>",
				"<text": "<Svg.Text",
				"</text>": "</Svg.Text>",
				"<tspan": "<Svg.TSpan",
				"</tspan>": "</Svg.TSpan>",
				"<defs": "<Svg.Defs",
				"</defs>": "</Svg.Defs>",
				"<linearGradient": "<Svg.LinearGradient",
				"</linearGradient>": "</Svg.LinearGradient>",
				"<radialGradient": "<Svg.RadialGradient",
				"</radialGradient>": "</Svg.RadialGradient>",
				"<stop": "<Svg.Stop",
				"</stop>": "</Svg.Stop>",
				"<clipPath": "<Svg.ClipPath",
				"</clipPath>": "</Svg.ClipPath>",
				"<mask": "<Svg.Mask",
				"</mask>": "</Svg.Mask>",
				"<use": "<Svg.Use",
				"</use>": "</Svg.Use>",
				"<symbol": "<Svg.Symbol",
				"</symbol>": "</Svg.Symbol>",
				"<marker": "<Svg.Marker",
				"</marker>": "</Svg.Marker>",
				"<pattern": "<Svg.Pattern",
				"</pattern>": "</Svg.Pattern>",
				"<image": "<Svg.Image",
				"</image>": "</Svg.Image>",
			};

			for (const [from, to] of Object.entries(tagMappings)) {
				converted = converted.replace(new RegExp(from, "g"), to);
			}

			const attributeMappings = {
				"stroke-width": "strokeWidth",
				"stroke-linecap": "strokeLinecap",
				"stroke-linejoin": "strokeLinejoin",
				"stroke-dasharray": "strokeDasharray",
				"stroke-dashoffset": "strokeDashoffset",
				"stroke-miterlimit": "strokeMiterlimit",
				"fill-rule": "fillRule",
				"fill-opacity": "fillOpacity",
				"stroke-opacity": "strokeOpacity",
				"clip-path": "clipPath",
				"clip-rule": "clipRule",
				"font-family": "fontFamily",
				"font-size": "fontSize",
				"font-weight": "fontWeight",
				"font-style": "fontStyle",
				"text-anchor": "textAnchor",
				"text-decoration": "textDecoration",
				"vector-effect": "vectorEffect",
				"stop-color": "stopColor",
				"stop-opacity": "stopOpacity",
				offset: "offset",
				"gradient-units": "gradientUnits",
				"gradient-transform": "gradientTransform",
				"spread-method": "spreadMethod",
				x1: "x1",
				y1: "y1",
				x2: "x2",
				y2: "y2",
				cx: "cx",
				cy: "cy",
				r: "r",
				rx: "rx",
				ry: "ry",
				viewBox: "viewBox",
			};

			for (const [from, to] of Object.entries(attributeMappings)) {
				const regex = new RegExp(`\\b${from}=`, "g");
				converted = converted.replace(regex, `${to}=`);
			}

			const usedComponents = new Set<string>();
			const componentRegex = /<(\w+)/g;
			let match: RegExpExecArray | null = componentRegex.exec(converted);
			while (match !== null) {
				const component = match[1];
				if (component !== "div" && component !== "span") {
					usedComponents.add(component);
				}
				match = componentRegex.exec(converted);
			}

			const importStatement = `import { Svg } from '@tiendanube/nube-sdk-jsx';\n\n`;

			const componentCode = `export const Component = () => {\n  return (\n ${converted
				.split("\n")
				.map((line) => `    ${line}`)
				.join("\n")}\n  );\n};`;

			setOutputCode(`${importStatement}${componentCode}`);
		} catch (error) {
			toast.error("Conversion Error", {
				description: "Please check if the SVG is in valid format",
			});
		}
	};

	const handleCopy = async () => {
		try {
			if (typeof chrome !== "undefined" && chrome.runtime) {
				const textArea = document.createElement("textarea");
				textArea.value = outputCode;
				textArea.style.position = "fixed";
				textArea.style.left = "-999999px";
				textArea.style.top = "-999999px";
				document.body.appendChild(textArea);
				textArea.focus();
				textArea.select();

				const successful = document.execCommand("copy");
				document.body.removeChild(textArea);

				if (successful) {
					toast.success("Copied!", {
						description: "Code copied to clipboard",
					});
					return;
				}
			}

			await navigator.clipboard.writeText(outputCode);
			toast.success("Copied!", {
				description: "Code copied to clipboard",
			});
		} catch (error) {
			alert(`Please copy this code manually:\n\n${outputCode}`);
			toast.error("Error", {
				description: "Could not copy automatically. Code shown in alert.",
			});
		}
	};

	const handleDownload = () => {
		const blob = new Blob([outputCode], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "SvgComponent.tsx";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);

		toast.success("Download started", {
			description: "SvgComponent.tsx file downloaded",
		});
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
									convertSvgToNubeSDK(e.target.value);
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
