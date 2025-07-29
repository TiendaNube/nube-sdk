import type {
	NubeComponentPath,
	NubeComponentPathProps,
} from "@tiendanube/nube-sdk-types";

/**
 * Creates a `svgPath` component.
 *
 * A `svgPath` is used for drawing custom paths in SVG graphics using path commands.
 * It supports properties like path data (d), fill, stroke, and various styling options
 * for creating complex shapes and curves.
 *
 * @param props - The properties for configuring the svgPath component.
 * @returns A `NubeComponentPath` object representing the svgPath component.
 */
export const svgPath = (props: NubeComponentPathProps): NubeComponentPath => ({
	type: "svgPath",
	...props,
});
