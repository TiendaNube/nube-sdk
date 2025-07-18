import type {
	NubeComponentField,
	NubeComponentFieldProps,
} from "@tiendanube/nube-sdk-types";
import { generateInternalId } from "./generateInternalId";

/**
 * Creates a `field` component.
 *
 * A `field` represents an input element in a form, such as text fields, dropdowns, or checkboxes.
 * It supports properties like `name`, `label`, and event handlers (`onChange`, `onBlur`, `onFocus`).
 *
 * @param props - The properties for configuring the field component.
 * @returns A `NubeComponentField` object representing the form field.
 */
export const field = (props: NubeComponentFieldProps): NubeComponentField => ({
	type: "field",
	...props,
	__internalId: generateInternalId("field", props),
});
