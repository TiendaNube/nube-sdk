/**
 * Code formatting utilities for the Nube DevTools extension
 */

/**
 * Formats TSX/JSX code with proper indentation
 * Simple formatter designed for Chrome extension context
 *
 * @param code - The TSX/JSX code to format
 * @returns Formatted code with proper indentation
 */
export function formatTsx(code: string): string {
	// Simple TSX formatter for Chrome extension context
	const lines = code.split("\n");
	const formattedLines: string[] = [];
	let indentLevel = 0;
	const indentSize = 2;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim();

		if (!line) {
			formattedLines.push("");
			continue;
		}

		// Decrease indent for closing tags and brackets
		if (line.startsWith("</") || line.startsWith(")") || line.startsWith("}")) {
			indentLevel = Math.max(0, indentLevel - 1);
		}

		// Add current line with proper indentation
		const indentedLine = " ".repeat(indentLevel * indentSize) + line;
		formattedLines.push(indentedLine);

		// Increase indent for opening tags and brackets
		if (
			(line.startsWith("<") &&
				!line.startsWith("</") &&
				!line.endsWith("/>")) ||
			line.endsWith("{") ||
			line.endsWith("(")
		) {
			indentLevel++;
		}
	}

	return formattedLines.join("\n");
}

/**
 * Formats SVG code by cleaning up common issues
 *
 * @param svgCode - Raw SVG code
 * @returns Cleaned SVG code
 */
export function cleanSvgCode(svgCode: string): string {
	return svgCode
		.replace(/<!--[\s\S]*?-->/g, "") // Remove HTML comments
		.replace(/<\?xml[\s\S]*?\?>/g, "") // Remove XML declarations (<?xml ... ?>)
		.replace(/<\?[\s\S]*?\?>/g, "") // Remove any other processing instructions (<? ... ?>)
		.replace(/\s+class\s*=\s*["'][^"']*["']/g, "") // Remove class attributes
		.replace(/\s+xmlns:[\w-]+\s*=\s*["'][^"']*["']/g, "") // Remove custom xmlns attributes
		.replace(/\s+id\s*=\s*["'][^"']*["']/g, "") // Remove id attributes
		.replace(/\s+style\s*=\s*["'][^"']*["']/g, "") // Remove style attributes
		.trim();
}

/**
 * Converts SVG code to NubeSDK JSX format
 *
 * @param svgString - Raw SVG string to convert
 * @returns Formatted TSX code ready to use with NubeSDK
 */
export function convertSvgToNubeSDK(svgString: string): string {
	const trimmedSvg = svgString.trim();
	if (!trimmedSvg) {
		return "";
	}

	try {
		let converted = cleanSvgCode(trimmedSvg);

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

		const rawCode = `${importStatement}${componentCode}`;
		const formattedCode = formatTsx(rawCode);
		return formattedCode;
	} catch (error) {
		throw new Error(
			"Conversion Error: Please check if the SVG is in valid format",
		);
	}
}
