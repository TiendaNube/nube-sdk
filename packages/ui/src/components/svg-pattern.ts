import type {
	NubeComponentPattern,
	NubeComponentPatternProps,
} from "@tiendanube/nube-sdk-types";
import { generateInternalId } from "./generateInternalId";

/**
 * Creates a `svgPattern` component.
 *
 * A `svgPattern` is used for defining repeating patterns in SVG graphics. It supports
 * properties like position (x, y), size (width, height), patternUnits, viewBox,
 * and can contain child elements that define the pattern content.
 *
 * @param props - The properties for configuring the svgPattern component.
 * @returns A `NubeComponentPattern` object representing the svgPattern component.
 */
export const svgPattern = (
	props: NubeComponentPatternProps,
): NubeComponentPattern => ({
	type: "svgPattern",
	...props,
	__internalId: generateInternalId("svgPattern", props),
});
