import type {
	NubeComponentTSpan,
	NubeComponentTSpanProps,
} from "@tiendanube/nube-sdk-types";
import { generateInternalId } from "./generateInternalId";

/**
 * Creates a `svgTspan` component.
 *
 * A `svgTspan` is used for styling portions of text within SVG text elements.
 * It supports properties like position (x, y), font styling, fill, stroke, and
 * various styling options for text spans within SVG text.
 *
 * @param props - The properties for configuring the svgTspan component.
 * @returns A `NubeComponentTSpan` object representing the svgTspan component.
 */
export const svgTspan = (
	props: NubeComponentTSpanProps,
): NubeComponentTSpan => ({
	type: "svgTspan",
	...props,
	__internalId: generateInternalId("svgTspan", props),
});
