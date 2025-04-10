import type {
	NubeComponentTextarea,
	NubeComponentTextareaProps,
} from "@tiendanube/nube-sdk-types";

/**
 * @deprecated This component has been deprecated since version `0.8.0`. Please use the `textarea` component instead.
 */
export const txtarea = (
	props: NubeComponentTextareaProps,
): NubeComponentTextarea => ({
	type: "txtarea",
	...props,
});

/**
 * Creates a `textarea` component.
 *
 * A `textarea` represents a multi-line text input field that allows users to enter longer texts.
 * It supports properties such as `name`, `value`, and event handlers (`onChange`, `onBlur`, `onFocus`).
 *
 * @param props - The properties for configuring the textarea component.
 * @returns A `NubeComponentTextarea` object representing the textarea component.
 */
export const textarea = (
	props: NubeComponentTextareaProps,
): NubeComponentTextarea => ({
	type: "txtarea",
	...props,
});
