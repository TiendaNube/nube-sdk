import type {
	NubeComponentPolygon,
	NubeComponentPolygonProps,
} from "@tiendanube/nube-sdk-types";
import { generateInternalId } from "./generateInternalId";

/**
 * Creates a `svgPolygon` component.
 *
 * A `svgPolygon` is used for drawing closed polygons in SVG graphics. It supports
 * properties like points (defining the polygon vertices), fill, stroke, and various
 * styling options for creating multi-sided shapes.
 *
 * @param props - The properties for configuring the svgPolygon component.
 * @returns A `NubeComponentPolygon` object representing the svgPolygon component.
 */
export const svgPolygon = (
	props: NubeComponentPolygonProps,
): NubeComponentPolygon => ({
	type: "svgPolygon",
	...props,
	__internalId: generateInternalId("svgPolygon", props),
});
