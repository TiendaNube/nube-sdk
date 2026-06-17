import type {
	NubeComponentFormRadio,
	NubeComponentFormRadioProps,
} from "@tiendanube/nube-sdk-types";
import { generateInternalId } from "./generateInternalId";

/**
 * Creates a `formRadio` component.
 *
 * A `formRadio` renders a group of radio inputs bound to the surrounding
 * `formRoot`. It mirrors the public `select` props shape (a list of
 * `{ label, value }` options + an optional default `value`) but renders as
 * a radio group and adds Form-driven validation (`required` is mapped to
 * the native `valueMissing` validity key when no option is selected).
 *
 * @param props - The properties for configuring the formRadio component.
 * @returns A `NubeComponentFormRadio` object representing the radio group.
 */
export const formRadio = (
	props: NubeComponentFormRadioProps,
): NubeComponentFormRadio => ({
	type: "formRadio",
	...props,
	__internalId: generateInternalId("formRadio", props),
});
