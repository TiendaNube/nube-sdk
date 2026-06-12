import type {
	NubeComponentFormCheckbox,
	NubeComponentFormCheckboxProps,
} from "@tiendanube/nube-sdk-types";
import { generateInternalId } from "./generateInternalId";

/**
 * Creates a `formCheckbox` component.
 *
 * A `formCheckbox` is a single checkbox bound to the surrounding `formRoot`.
 * It mirrors the public `checkbox` props but adds Form-driven validation
 * (`required` is mapped to the native `valueMissing` validity key).
 *
 * @param props - The properties for configuring the formCheckbox component.
 * @returns A `NubeComponentFormCheckbox` object representing the checkbox.
 */
export const formCheckbox = (
	props: NubeComponentFormCheckboxProps,
): NubeComponentFormCheckbox => ({
	type: "formCheckbox",
	...props,
	__internalId: generateInternalId("formCheckbox", props),
});
