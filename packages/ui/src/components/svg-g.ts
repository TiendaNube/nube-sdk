import type {
	NubeComponentG,
	NubeComponentGProps,
} from "@tiendanube/nube-sdk-types";
import { generateInternalId } from "./generateInternalId";

/**
 * Creates a `svgG` component.
 *
 * A `svgG` is used for grouping SVG elements together. It can contain other SVG
 * elements as children and supports properties like transform and opacity that
 * apply to all child elements.
 *
 * @param props - The properties for configuring the svgG component.
 * @returns A `NubeComponentG` object representing the svgG component.
 */
export const svgG = (props: NubeComponentGProps): NubeComponentG => ({
	type: "svgG",
	...props,
	__internalId: generateInternalId("svgG", props),
});
