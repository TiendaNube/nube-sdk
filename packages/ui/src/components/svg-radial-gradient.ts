import type {
	NubeComponentRadialGradient,
	NubeComponentRadialGradientProps,
} from "@tiendanube/nube-sdk-types";
import { generateInternalId } from "./generateInternalId";

/**
 * Creates a `svgRadialGradient` component.
 *
 * A `svgRadialGradient` is used for defining radial gradients in SVG graphics.
 * It supports properties like center (cx, cy), radius (r), focal point (fx, fy),
 * gradientUnits, and can contain stop elements to define color transitions.
 *
 * @param props - The properties for configuring the svgRadialGradient component.
 * @returns A `NubeComponentRadialGradient` object representing the svgRadialGradient component.
 */
export const svgRadialGradient = (
	props: NubeComponentRadialGradientProps,
): NubeComponentRadialGradient => ({
	type: "svgRadialGradient",
	...props,
	__internalId: generateInternalId("svgRadialGradient", props),
});
