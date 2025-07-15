/**
 * Minifies an inline CSS string by removing line breaks and unnecessary spaces.
 */
export function minify(css: string): string {
	return css
		.replace(/\/\*[\s\S]*?\*\//g, "") // remove comments
		.replace(/\s*([\{\}:;,])\s*/g, "$1") // remove spaces around { } : ; ,
		.replace(/\s+/g, " ") // collapse multiple spaces into one
		.replace(/;\}/g, "}") // remove ; before }
		.replace(/\n/g, "") // remove break lines
		.trim();
}
