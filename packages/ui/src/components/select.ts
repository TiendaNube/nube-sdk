import type {
	NubeComponentSelect,
	NubeComponentSelectProps,
} from "@tiendanube/nube-sdk-types";

/**
 * Creates a `select` component.
 *
 * A `select` represents a dropdown menu that allows users to select one option from a list.
 * It supports properties such as `name`, `label`, `options`, and event handlers (`onChange`).
 */
export const select = (
	props: NubeComponentSelectProps,
): NubeComponentSelect => ({
	type: "select",
	...props,
});
