import type {
	NubeComponentSvg,
	NubeComponentSvgProps,
} from "@tiendanube/nube-sdk-types";

/**
 * Creates an `svgRoot` component.
 *
 * An `svgRoot` is the root container for SVG graphics, defining the coordinate system
 * and viewport for all child SVG elements. It supports properties like width, height,
 * viewBox, and preserveAspectRatio.
 *
 * @param props - The properties for configuring the svgRoot component.
 * @returns A `NubeComponentSvg` object representing the svgRoot component.
 */
export const svgRoot = (props: NubeComponentSvgProps): NubeComponentSvg => ({
	type: "svgRoot",
	...props,
});
