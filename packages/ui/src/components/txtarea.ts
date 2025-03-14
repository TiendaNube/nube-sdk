import type {
	NubeComponentTxtArea,
	NubeComponentTxtAreaProps,
} from "@tiendanube/nube-sdk-types";

/**
 * Creates a `txtarea` component.
 *
 * A `txtarea` represents a multi-line text input field that allows users to enter longer texts.
 * It supports properties such as `name`, `value`, and event handlers (`onChange`, `onBlur`, `onFocus`).
 *
 * @param props - The properties for configuring the textarea component.
 * @returns A `NubeComponentTxtArea` object representing the textarea component.
 */
export const txtarea = (
	props: NubeComponentTxtAreaProps,
): NubeComponentTxtArea => ({
	type: "txtarea",
	...props,
});
