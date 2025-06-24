import type {
	NubeComponentToastDescription,
	NubeComponentToastDescriptionProps,
} from "@tiendanube/nube-sdk-types";

/**
 * Creates a `toast` description component.
 *
 * A `toast` description is a small notification that appears at the bottom of the screen to inform the user about an action or a message.
 * It supports properties such as `children` for the description text, and custom styling.
 */
export const toastDescription = (
	props: NubeComponentToastDescriptionProps,
): NubeComponentToastDescription => ({
	type: "toastDescription",
	...props,
});
