import type {
	NubeComponentRect,
	NubeComponentRectProps,
} from "@tiendanube/nube-sdk-types";

/**
 * Creates a `svgRect` component.
 *
 * A `svgRect` is used for drawing rectangles in SVG graphics. It supports properties
 * like position (x, y), size (width, height), corner radius (rx, ry), fill, stroke,
 * and various styling options.
 *
 * @param props - The properties for configuring the svgRect component.
 * @returns A `NubeComponentRect` object representing the svgRect component.
 */
export const svgRect = (props: NubeComponentRectProps): NubeComponentRect => ({
	type: "svgRect",
	...props,
});
