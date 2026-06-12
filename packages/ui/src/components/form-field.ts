import type {
	NubeComponentFormField,
	NubeComponentFormFieldProps,
} from "@tiendanube/nube-sdk-types";
import { generateInternalId } from "./generateInternalId";

/**
 * Creates a `formField` component.
 *
 * A `formField` is the declarative counterpart of an HTML `<input>` bound to
 * the surrounding `formRoot`. It supports the native Constraint Validation
 * API attributes (`required`, `minLength`, `maxLength`, `pattern`) and an
 * extra `maxSize` for `inputType: "file"` that the adapter maps to
 * `rangeOverflow`.
 *
 * @param props - The properties for configuring the formField component.
 * @returns A `NubeComponentFormField` object representing the form input.
 */
export const formField = (
	props: NubeComponentFormFieldProps,
): NubeComponentFormField => ({
	type: "formField",
	...props,
	__internalId: generateInternalId("formField", props),
});
