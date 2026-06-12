import type {
	NubeComponentPopoverRoot,
	NubeComponentPopoverRootProps,
} from "@tiendanube/nube-sdk-types";
import { generateInternalId } from "./generateInternalId";

/**
 * Creates a `popover` root component.
 *
 * A `popover` is a floating container whose content becomes visible when its
 * trigger button is clicked. The root acts as the wrapper that holds both the
 * `popover-button` and the `popover-content`.
 * It supports properties such as `defaultOpen` and custom styling.
 */
export const popoverRoot = (
	props: NubeComponentPopoverRootProps,
): NubeComponentPopoverRoot => ({
	type: "popoverRoot",
	...props,
	__internalId: generateInternalId("popoverRoot", props),
});
