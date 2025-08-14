import type {
	NubeComponentStop,
	NubeComponentStopProps,
} from "@tiendanube/nube-sdk-types";

/**
 * Creates a `svgStop` component.
 *
 * A `svgStop` is used within gradient definitions to specify color stops. It supports
 * properties like offset (position in the gradient), stopColor, and stopOpacity
 * for defining gradient color transitions.
 *
 * @param props - The properties for configuring the svgStop component.
 * @returns A `NubeComponentStop` object representing the svgStop component.
 */
export const svgStop = (props: NubeComponentStopProps): NubeComponentStop => ({
	type: "svgStop",
	...props,
});
