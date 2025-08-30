import type {
	NubeComponentClipPath,
	NubeComponentClipPathProps,
} from "@tiendanube/nube-sdk-types";

/**
 * Creates a `svgClipPath` component.
 *
 * A `svgClipPath` is used for defining clipping paths in SVG graphics that restrict
 * the rendering area of other elements. It supports properties like clipPathUnits
 * and can contain child elements that define the clipping shape.
 *
 * @param props - The properties for configuring the svgClipPath component.
 * @returns A `NubeComponentClipPath` object representing the svgClipPath component.
 */
export const svgClipPath = (
	props: NubeComponentClipPathProps,
): NubeComponentClipPath => ({
	type: "svgClipPath",
	...props,
});
