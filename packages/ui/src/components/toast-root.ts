import type {
	NubeComponentToastRoot,
	NubeComponentToastRootProps,
} from "@tiendanube/nube-sdk-types";

/**
 * Creates a `toast` component.
 *
 * A `toast` is a small notification that appears at the bottom of the screen to inform the user about an action or a message.
 * It supports properties such as `type` for controlling the type of toast, and custom styling.
 */
export const toastRoot = (
	props: NubeComponentToastRootProps,
): NubeComponentToastRoot => ({
	type: "toastRoot",
	...props,
});
