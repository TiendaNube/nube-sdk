import type {
	NubeComponentPolyline,
	NubeComponentPolylineProps,
} from "@tiendanube/nube-sdk-types";

/**
 * Creates a `svgPolyline` component.
 *
 * A `svgPolyline` is used for drawing open polylines in SVG graphics. It supports
 * properties like points (defining the line segments), fill, stroke, and various
 * styling options for creating connected line segments.
 *
 * @param props - The properties for configuring the svgPolyline component.
 * @returns A `NubeComponentPolyline` object representing the svgPolyline component.
 */
export const svgPolyline = (
	props: NubeComponentPolylineProps,
): NubeComponentPolyline => ({
	type: "svgPolyline",
	...props,
});
