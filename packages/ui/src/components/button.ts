import type {
	NubeComponentButton,
	NubeComponentButtonProps,
} from "@tiendanube/nube-sdk-types";

/**
 * Creates a `button` component.
 *
 * A `button` represents a clickable element typically used to trigger an action or submit a form.
 * It supports properties such as `text`, `onClick`, and style configurations.
 *
 * @param props - The properties for configuring the button component.
 * @returns A `NubeComponentButton` object representing the button component.
 */
export const button = (
	props: NubeComponentButtonProps,
): NubeComponentButton => ({
	type: "button",
	...props,
});
