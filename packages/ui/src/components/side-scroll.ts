import type {
	NubeComponentSideScroll,
	NubeComponentSideScrollProps,
} from "@tiendanube/nube-sdk-types";
import { generateInternalId } from "./generateInternalId";

/**
 * Creates a `sidescroll` component.
 *
 * A `sidescroll` is a horizontal scrolling container that allows users to scroll through content
 * that extends beyond the container's visible width. It supports customizable gap between items
 * and can optionally hide the scrollbar for a cleaner appearance.
 *
 * @param props - The properties for configuring the sidescroll component.
 * @returns A `NubeComponentSideScroll` object representing the sidescroll component.
 */
export const sideScroll = (
	props: NubeComponentSideScrollProps,
): NubeComponentSideScroll => ({
	type: "sidescroll",
	...props,
	__internalId: generateInternalId("sidescroll", props),
});
