import type {
	NubeComponentLinearGradient,
	NubeComponentLinearGradientProps,
} from "@tiendanube/nube-sdk-types";

/**
 * Creates a `svgLinearGradient` component.
 *
 * A `svgLinearGradient` is used for defining linear gradients in SVG graphics.
 * It supports properties like gradient direction (x1, y1, x2, y2), gradientUnits,
 * and can contain stop elements to define color transitions.
 *
 * @param props - The properties for configuring the svgLinearGradient component.
 * @returns A `NubeComponentLinearGradient` object representing the svgLinearGradient component.
 */
export const svgLinearGradient = (
	props: NubeComponentLinearGradientProps,
): NubeComponentLinearGradient => ({
	type: "svgLinearGradient",
	...props,
});
