import type {
	NubeComponentSvgText,
	NubeComponentSvgTextProps,
} from "@tiendanube/nube-sdk-types";
import { generateInternalId } from "./generateInternalId";

/**
 * Creates a `svgText` component.
 *
 * A `svgText` is used for rendering text in SVG graphics. It supports properties
 * like position (x, y), font styling (fontSize, fontFamily, fontWeight), text
 * alignment, fill, stroke, and various styling options for text rendering.
 *
 * @param props - The properties for configuring the svgText component.
 * @returns A `NubeComponentSvgText` object representing the svgText component.
 */
export const svgText = (
	props: NubeComponentSvgTextProps,
): NubeComponentSvgText => ({
	type: "svgText",
	...props,
	__internalId: generateInternalId("svgText", props),
});
