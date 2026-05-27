import type {
	NubeComponentFormSubmitter,
	NubeComponentFormSubmitterProps,
} from "@tiendanube/nube-sdk-types";
import { generateInternalId } from "./generateInternalId";

/**
 * Creates a `formSubmitter` component.
 *
 * A `formSubmitter` is equivalent to `<button type="submit">` and triggers
 * the submission of the surrounding `formRoot`. Children render as the
 * button label.
 *
 * @param props - The properties for configuring the formSubmitter component.
 * @returns A `NubeComponentFormSubmitter` object representing the button.
 */
export const formSubmitter = (
	props: NubeComponentFormSubmitterProps,
): NubeComponentFormSubmitter => ({
	type: "formSubmitter",
	...props,
	__internalId: generateInternalId("formSubmitter", props),
});
