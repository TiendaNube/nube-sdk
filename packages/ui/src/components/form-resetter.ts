import type {
	NubeComponentFormResetter,
	NubeComponentFormResetterProps,
} from "@tiendanube/nube-sdk-types";
import { generateInternalId } from "./generateInternalId";

/**
 * Creates a `formResetter` component.
 *
 * A `formResetter` is equivalent to `<button type="reset">` and clears every
 * descendant form field back to its initial value when clicked. The reset
 * is handled by the surrounding `formRoot` listening to the native form
 * `reset` event — no worker round-trip is required.
 *
 * @param props - The properties for configuring the formResetter component.
 * @returns A `NubeComponentFormResetter` object representing the button.
 */
export const formResetter = (
	props: NubeComponentFormResetterProps,
): NubeComponentFormResetter => ({
	type: "formResetter",
	...props,
	__internalId: generateInternalId("formResetter", props),
});
