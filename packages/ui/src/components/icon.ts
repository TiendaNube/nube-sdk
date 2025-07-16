import type {
	NubeComponentIcon,
	NubeComponentIconProps,
} from "@tiendanube/nube-sdk-types";

/**
 * Creates an `icon` component.
 *
 * @param props - The properties for configuring the icon component.
 * @returns A `NubeComponentIcon` object representing the icon.
 */
export const icon = (props: NubeComponentIconProps): NubeComponentIcon => ({
	type: "icon",
	...props,
});
