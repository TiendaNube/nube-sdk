import type {
	NubeComponentNumberField,
	NubeComponentNumberFieldProps,
} from "@tiendanube/nube-sdk-types";
import { generateInternalId } from "./generateInternalId";

/**
 * Creates a `numberfield` component.
 *
 * A `numberfield` represents a numeric input element with increment/decrement buttons.
 * It supports properties like `name`, `label`, `min`, `max`, `step`, and event handlers.
 *
 * @param props - The properties for configuring the numberfield component.
 * @returns A `NubeComponentNumberField` object representing the numeric form field.
 */
export const numberfield = (
	props: NubeComponentNumberFieldProps,
): NubeComponentNumberField => ({
	type: "numberfield",
	...props,
	__internalId: generateInternalId("numberfield", props),
});
