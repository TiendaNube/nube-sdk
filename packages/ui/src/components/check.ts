import type {
	NubeComponentCheck,
	NubeComponentCheckProps,
} from "@tiendanube/nube-sdk-types";

/**
 * Creates a `check` component.
 *
 * A `check` represents a selectable field that can be toggled between checked and unchecked states.
 * It is typically used to allow users to select one or more options.
 * Supports properties such as `name`, `label`, `checked`, and event handlers (`onChange`).
 *
 * @param props - The properties for configuring the checkbox component.
 * @returns A `NubeComponentCheck` object representing the checkbox.
 */
export const check = (props: NubeComponentCheckProps): NubeComponentCheck => ({
	type: "check",
	...props,
});
