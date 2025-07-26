import type {
	NubeComponentFeOffset,
	NubeComponentFeOffsetProps,
} from "@tiendanube/nube-sdk-types";

/**
 * Creates a `svgFeOffset` component.
 *
 * A `svgFeOffset` is a filter primitive that offsets the input image by a specified
 * amount. It supports properties like dx, dy (offset distances) and in (input source)
 * for creating shadow and displacement effects.
 *
 * @param props - The properties for configuring the svgFeOffset component.
 * @returns A `NubeComponentFeOffset` object representing the svgFeOffset component.
 */
export const svgFeOffset = (
	props: NubeComponentFeOffsetProps,
): NubeComponentFeOffset => ({
	type: "svgFeOffset",
	...props,
});
