import type {
	NubeComponentUse,
	NubeComponentUseProps,
} from "@tiendanube/nube-sdk-types";
import { generateInternalId } from "./generateInternalId";

/**
 * Creates a `svgUse` component.
 *
 * A `svgUse` is used for referencing and reusing other SVG elements. It supports
 * properties like href (reference to the element), position (x, y), size (width, height),
 * and transform for positioning and scaling the referenced element.
 *
 * @param props - The properties for configuring the svgUse component.
 * @returns A `NubeComponentUse` object representing the svgUse component.
 */
export const svgUse = (props: NubeComponentUseProps): NubeComponentUse => ({
	type: "svgUse",
	...props,
	__internalId: generateInternalId("svgUse", props),
});
