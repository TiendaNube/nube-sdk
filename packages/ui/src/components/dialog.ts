import type {
	NubeComponentDialog,
	NubeComponentDialogProps,
} from "@tiendanube/nube-sdk-types";

/**
 * Creates a `dialog` component.
 *
 * A `dialog` is a modal window used for user interactions,
 * allowing the display of titles, content, and specific actions.
 *
 * @param props - The properties for configuring the dialog component.
 * @returns A `NubeComponentDialog` object representing the dialog component.
 */
export const dialog = (
	props: NubeComponentDialogProps,
): NubeComponentDialog => ({
	type: "dialog",
	...props,
});
