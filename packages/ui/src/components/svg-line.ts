import type {
	NubeComponentLine,
	NubeComponentLineProps,
} from "@tiendanube/nube-sdk-types";

/**
 * Creates a `svgLine` component.
 *
 * A `svgLine` is used for drawing straight lines in SVG graphics. It supports
 * properties like start point (x1, y1), end point (x2, y2), stroke, strokeWidth,
 * and various stroke styling options.
 *
 * @param props - The properties for configuring the svgLine component.
 * @returns A `NubeComponentLine` object representing the svgLine component.
 */
export const svgLine = (props: NubeComponentLineProps): NubeComponentLine => ({
	type: "svgLine",
	...props,
});
