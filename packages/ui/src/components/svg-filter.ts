import type {
	NubeComponentFilter,
	NubeComponentFilterProps,
} from "@tiendanube/nube-sdk-types";
import { generateInternalId } from "./generateInternalId";

/**
 * Creates a `svgFilter` component.
 *
 * A `svgFilter` is used for defining filter effects in SVG graphics. It supports
 * properties like position (x, y), size (width, height), filterUnits, primitiveUnits,
 * and can contain filter primitive elements that define the filter operations.
 *
 * @param props - The properties for configuring the svgFilter component.
 * @returns A `NubeComponentFilter` object representing the svgFilter component.
 */
export const svgFilter = (
	props: NubeComponentFilterProps,
): NubeComponentFilter => ({
	type: "svgFilter",
	...props,
	__internalId: generateInternalId("svgFilter", props),
});
