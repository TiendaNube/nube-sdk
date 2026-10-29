import type {
	NubeComponentPopoverContent,
	NubeComponentPopoverContentProps,
} from "@tiendanube/nube-sdk-types";
import { generateInternalId } from "./generateInternalId";
import { scopedClassNameProp } from "./scopedClassNameProp";

/**
 * Creates a `popover` content component.
 *
 * A `popover-content` holds the floating content that becomes visible when the
 * popover button is clicked. It inherits the style and props of the `box`
 * component and uses theme variables for its default background, border and
 * box shadow.
 */
export const popoverContent = (
	props: NubeComponentPopoverContentProps,
): NubeComponentPopoverContent => ({
	type: "popoverContent",
	...props,
	...scopedClassNameProp(props.className),
	__internalId: generateInternalId("popoverContent", props),
});
