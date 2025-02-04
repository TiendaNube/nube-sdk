import type {
	NubeComponentBox,
	NubeComponentBoxProps,
} from "@tiendanube/nube-sdk-types";

/**
 * Creates a `box` component.
 *
 * A `box` is a flexible container that can be used for layout purposes.
 * It supports properties like width, height, padding, margin, and flex-based alignment.
 *
 * @param props - The properties for configuring the box component.
 * @returns A `NubeComponentBox` object representing the box component.
 */
export const box = (props: NubeComponentBoxProps): NubeComponentBox => ({
	type: "box",
	...props,
});
