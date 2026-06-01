import type {
	NubeComponentFormFieldError,
	NubeComponentFormFieldErrorProps,
} from "@tiendanube/nube-sdk-types";
import { generateInternalId } from "./generateInternalId";

/**
 * Creates a `formFieldError` component.
 *
 * A `formFieldError` is an inline validation message associated with a
 * single `formField`. It must be a direct child of `formField`. The error
 * remains in the DOM at all times and its visibility is controlled via CSS
 * using the parent's `data-validity-state` / `data-validity-error`
 * attributes.
 *
 * @param props - The properties for configuring the formFieldError component.
 * @returns A `NubeComponentFormFieldError` object representing the message.
 */
export const formFieldError = (
	props: NubeComponentFormFieldErrorProps,
): NubeComponentFormFieldError => ({
	type: "formFieldError",
	...props,
	__internalId: generateInternalId("formFieldError", props),
});
