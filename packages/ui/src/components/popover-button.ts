import type {
	NubeComponentPopoverButton,
	NubeComponentPopoverButtonProps,
} from "@tiendanube/nube-sdk-types";
import { generateInternalId } from "./generateInternalId";

/**
 * Creates a `popover` button component.
 *
 * A `popover-button` is the trigger that toggles the visibility of the popover
 * content. It inherits the style and props of the `button` component, except
 * for `onClick`, which is managed internally to control the popover.
 */
export const popoverButton = (
	props: NubeComponentPopoverButtonProps,
): NubeComponentPopoverButton => ({
	type: "popoverButton",
	...props,
	__internalId: generateInternalId("popoverButton", props),
});
