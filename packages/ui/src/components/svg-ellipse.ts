import type {
	NubeComponentEllipse,
	NubeComponentEllipseProps,
} from "@tiendanube/nube-sdk-types";

/**
 * Creates a `svgEllipse` component.
 *
 * A `svgEllipse` is used for drawing ellipses in SVG graphics. It supports properties
 * like center coordinates (cx, cy), radius (rx, ry), fill, stroke, and various
 * styling options for creating oval shapes.
 *
 * @param props - The properties for configuring the svgEllipse component.
 * @returns A `NubeComponentEllipse` object representing the svgEllipse component.
 */
export const svgEllipse = (
	props: NubeComponentEllipseProps,
): NubeComponentEllipse => ({
	type: "svgEllipse",
	...props,
});
