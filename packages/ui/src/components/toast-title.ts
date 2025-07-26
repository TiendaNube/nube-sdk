import type {
	NubeComponentToastTitle,
	NubeComponentToastTitleProps,
} from "@tiendanube/nube-sdk-types";
import { generateInternalId } from "./generateInternalId";

/**
 * Creates a `toast` title component.
 *
 * A `toast` title is a small notification that appears at the bottom of the screen to inform the user about an action or a message.
 * It supports properties such as `children` for the title text, and custom styling.
 */
export const toastTitle = (
	props: NubeComponentToastTitleProps,
): NubeComponentToastTitle => ({
	type: "toastTitle",
	...props,
	__internalId: generateInternalId("toastTitle", props),
});
