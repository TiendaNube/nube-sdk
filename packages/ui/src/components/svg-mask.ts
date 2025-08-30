import type {
	NubeComponentMask,
	NubeComponentMaskProps,
} from "@tiendanube/nube-sdk-types";

/**
 * Creates a `svgMask` component.
 *
 * A `svgMask` is used for defining masks in SVG graphics that control the opacity
 * of other elements. It supports properties like position (x, y), size (width, height),
 * maskUnits, and can contain child elements that define the mask content.
 *
 * @param props - The properties for configuring the svgMask component.
 * @returns A `NubeComponentMask` object representing the svgMask component.
 */
export const svgMask = (props: NubeComponentMaskProps): NubeComponentMask => ({
	type: "svgMask",
	...props,
});
