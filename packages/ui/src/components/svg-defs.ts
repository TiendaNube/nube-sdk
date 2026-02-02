import type {
	NubeComponentDefs,
	NubeComponentDefsProps,
} from "@tiendanube/nube-sdk-types";
import { generateInternalId } from "./generateInternalId";

/**
 * Creates a `svgDefs` component.
 *
 * A `svgDefs` is used for defining reusable SVG elements like gradients, patterns,
 * filters, and other definitions. It can contain child elements that define
 * reusable graphics objects.
 *
 * @param props - The properties for configuring the svgDefs component.
 * @returns A `NubeComponentDefs` object representing the svgDefs component.
 */
export const svgDefs = (props: NubeComponentDefsProps): NubeComponentDefs => ({
	type: "svgDefs",
	...props,
	__internalId: generateInternalId("svgDefs", props),
});
