import type {
	NubeComponentFormSelect,
	NubeComponentFormSelectProps,
} from "@tiendanube/nube-sdk-types";
import { generateInternalId } from "./generateInternalId";

/**
 * Creates a `formSelect` component.
 *
 * A `formSelect` is the dropdown counterpart of `formField`, bound to the
 * surrounding `formRoot`. It mirrors the public `select` props but adds
 * Form-driven validation (data-validity-state, blur-triggered pristine
 * transition, force-validation on submit).
 *
 * @param props - The properties for configuring the formSelect component.
 * @returns A `NubeComponentFormSelect` object representing the select.
 */
export const formSelect = (
	props: NubeComponentFormSelectProps,
): NubeComponentFormSelect => ({
	type: "formSelect",
	...props,
	__internalId: generateInternalId("formSelect", props),
});
