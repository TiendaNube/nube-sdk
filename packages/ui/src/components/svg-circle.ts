import type {
	NubeComponentCircle,
	NubeComponentCircleProps,
} from "@tiendanube/nube-sdk-types";

/**
 * Creates a `svgCircle` component.
 *
 * A `svgCircle` is used for drawing circles in SVG graphics. It supports properties
 * like center coordinates (cx, cy), radius (r), fill, stroke, and various stroke
 * styling options.
 *
 * @param props - The properties for configuring the svgCircle component.
 * @returns A `NubeComponentCircle` object representing the svgCircle component.
 */
export const svgCircle = (
	props: NubeComponentCircleProps,
): NubeComponentCircle => ({
	type: "svgCircle",
	...props,
});
