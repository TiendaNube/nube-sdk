import type {
	NubeComponentSymbol,
	NubeComponentSymbolProps,
} from "@tiendanube/nube-sdk-types";

/**
 * Creates a `svgSymbol` component.
 *
 * A `svgSymbol` is used for defining reusable symbols in SVG graphics. It supports
 * properties like viewBox, preserveAspectRatio, and can contain child elements
 * that define the symbol content for later reuse with the use element.
 *
 * @param props - The properties for configuring the svgSymbol component.
 * @returns A `NubeComponentSymbol` object representing the svgSymbol component.
 */
export const svgSymbol = (
	props: NubeComponentSymbolProps,
): NubeComponentSymbol => ({
	type: "svgSymbol",
	...props,
});
