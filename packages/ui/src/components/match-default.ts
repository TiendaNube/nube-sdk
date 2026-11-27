import type {
	NubeComponentMatchDefault,
	NubeComponentMatchDefaultProps,
} from "@tiendanube/nube-sdk-types";
import { generateInternalId } from "./generateInternalId";

/**
 * Creates a `matchDefault` component, the branch of `matchValue` rendered when
 * no `matchWhen` matches the value of its signal.
 *
 * @param props - The properties for configuring the matchDefault component.
 * @returns A `NubeComponentMatchDefault` object representing the component.
 */
export const matchDefault = (
	props: NubeComponentMatchDefaultProps,
): NubeComponentMatchDefault => ({
	type: "matchDefault",
	...props,
	__internalId: generateInternalId("matchDefault", props),
});
