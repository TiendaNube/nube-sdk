import type {
	NubeComponentFragment,
	NubeComponentFragmentProps,
} from "@tiendanube/nube-sdk-types";
import { generateInternalId } from "./generateInternalId";

/**
 * Creates a `fragment` component.
 *
 * A `fragment` is a logical grouping element that allows multiple children
 * to be wrapped without introducing an additional DOM node.
 *
 * @param props - The properties for configuring the fragment component.
 * @returns A `NubeComponentFragment` object representing the fragment.
 */
export const fragment = (
	props: NubeComponentFragmentProps,
): NubeComponentFragment => ({
	type: "fragment",
	...props,
	__internalId: generateInternalId("fragment", props),
});
