import type {
	NubeComponentLink,
	NubeComponentLinkProps,
} from "@tiendanube/nube-sdk-types";
import { generateInternalId } from "./generateInternalId";

/**
 * Creates a `link` component.
 *
 * The `link` component is used for navigation links. It supports properties such as
 * `href`, `target`, `rel`, `disabled`, `variant`, and `onClick` event handling.
 * Links can be styled with different variants (primary, secondary, transparent)
 * and support both internal and external navigation.
 *
 * @param props - The properties for configuring the link component.
 * @returns A `NubeComponentLink` object representing the link component.
 */
export const link = (props: NubeComponentLinkProps): NubeComponentLink => ({
	type: "link",
	...props,
	__internalId: generateInternalId("link", props),
});
