import type {
	NubeComponentCheckbox,
	NubeComponentCheckboxProps,
} from "@tiendanube/nube-sdk-types";
import { generateInternalId } from "./generateInternalId";

/**
 * @deprecated This component has been deprecated since version `0.8.0`. Please use the `checkbox` component instead.
 */
export const check = (
	props: NubeComponentCheckboxProps,
): NubeComponentCheckbox => ({
	type: "check",
	...props,
	__internalId: generateInternalId("check", props),
});

/**
 * Creates a `checkbox` component.
 *
 * A `checkbox` represents a selectable field that can be toggled between checked and unchecked states.
 * It is typically used to allow users to select one or more options.
 * Supports properties such as `name`, `label`, `checked`, and event handlers (`onChange`).
 *
 * @param props - The properties for configuring the checkbox component.
 * @returns A `NubeComponentCheckbox` object representing the checkbox.
 */
export const checkbox = (
	props: NubeComponentCheckboxProps,
): NubeComponentCheckbox => ({
	type: "check",
	...props,
});
