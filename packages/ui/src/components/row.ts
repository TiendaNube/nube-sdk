import type {
	NubeComponentRow,
	NubeComponentRowProps,
} from "@tiendanube/nube-sdk-types";
import { generateInternalId } from "./generateInternalId";

/**
 * Creates a `row` component.
 *
 * A `row` is a flexible container used for structuring layouts in a horizontal direction.
 * It inherits most properties from `box`, except for the `direction` property.
 *
 * @param props - The properties for configuring the row component.
 * @returns A `NubeComponentRow` object representing the row component.
 */
export const row = (props: NubeComponentRowProps): NubeComponentRow => ({
	type: "row",
	...props,
	__internalId: generateInternalId("row", props),
});
