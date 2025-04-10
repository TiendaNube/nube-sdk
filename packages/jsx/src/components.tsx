import type {
	NubeComponentBox,
	NubeComponentBoxProps,
	NubeComponentButton,
	NubeComponentButtonProps,
	NubeComponentCheckbox,
	NubeComponentCheckboxProps,
	NubeComponentColumn,
	NubeComponentColumnProps,
	NubeComponentField,
	NubeComponentFieldProps,
	NubeComponentFragment,
	NubeComponentFragmentProps,
	NubeComponentImage,
	NubeComponentImageProps,
	NubeComponentRow,
	NubeComponentRowProps,
	NubeComponentText,
	NubeComponentTextProps,
	NubeComponentTextarea,
	NubeComponentTextareaProps,
} from "@tiendanube/nube-sdk-types";
import {
	box,
	button,
	checkbox,
	column,
	field,
	fragment,
	image,
	row,
	text,
	textarea,
} from "@tiendanube/nube-sdk-ui";

/**
 * Creates a `Box` component.
 *
 * The `Box` component is a flexible container used for structuring layouts.
 * It supports properties like width, height, padding, margin, and flex-based alignment.
 *
 * @param props - The properties for configuring the box component.
 * @returns A `NubeComponentBox` object representing the box component.
 */
export function Box(props: NubeComponentBoxProps): NubeComponentBox {
	return box(props);
}

/**
 * @deprecated This component has been deprecated since version `0.8.0`. Please use the `Column` component instead.
 */
export function Col(props: NubeComponentColumnProps): NubeComponentColumn {
	return column(props);
}

/**
 * Creates a `Col` (column) component.
 *
 * The `Col` component is a flexible column container used for structuring layouts.
 * It inherits most properties from `Box`, except for the `direction` property.
 *
 * @param props - The properties for configuring the column component.
 * @returns A `NubeComponentColumn` object representing the column component.
 */
export function Column(props: NubeComponentColumnProps): NubeComponentColumn {
	return column(props);
}

/**
 * Creates a `Row` component.
 *
 * The `Row` component is a flexible row container used for structuring layouts in a horizontal direction.
 * It inherits most properties from `Box`, except for the `direction` property.
 *
 * @param props - The properties for configuring the row component.
 * @returns A `NubeComponentRow` object representing the row component.
 */
export function Row(props: NubeComponentRowProps): NubeComponentRow {
	return row(props);
}

/**
 * Creates a `Field` component.
 *
 * The `Field` component represents an input element in a form, such as text fields, dropdowns, or checkboxes.
 * It supports properties like `name`, `label`, and event handlers (`onChange`, `onBlur`, `onFocus`).
 *
 * @param props - The properties for configuring the field component.
 * @returns A `NubeComponentField` object representing the form field.
 */
export function Field(props: NubeComponentFieldProps): NubeComponentField {
	return field(props);
}

/**
 * Creates a `Button` component.
 *
 * The `Button` component represents a clickable element typically used to trigger an action or submit a form.
 * It supports properties like `text` and event handlers (e.g., `onClick`).
 *
 * @param props - The properties for configuring the button component.
 * @returns A `NubeComponentButton` object representing the button component.
 */
export function Button(props: NubeComponentButtonProps): NubeComponentButton {
	return button(props);
}

/**
 * Creates a `Fragment` component.
 *
 * The `Fragment` component is a logical grouping element that allows multiple children
 * to be wrapped without introducing an additional DOM node.
 *
 * @param props - The properties for configuring the fragment component.
 * @returns A `NubeComponentFragment` object representing the fragment.
 */
export function Fragment(
	props: NubeComponentFragmentProps,
): NubeComponentFragment {
	return fragment(props);
}

/**
 * @deprecated This component has been deprecated since version `0.8.0`. Please use the `Text` component instead.
 */
export function Txt(props: NubeComponentTextProps): NubeComponentText {
	return text(props);
}

/**
 * Creates a `Text` (text) component.
 *
 * The `Text` component is used to render text with optional styling.
 * It supports properties such as `color`, `background`, `heading` levels (h1-h6),
 * text formatting `modifiers` (bold, italic, etc.), and inline display.
 *
 * @param props - The properties for configuring the text component.
 * @returns A `NubeComponentText` object representing the text component.
 */
export function Text(props: NubeComponentTextProps): NubeComponentText {
	return text(props);
}

/**
 * @deprecated This component has been deprecated since version `0.8.0`. Please use the `Checkbox` component instead.
 */
export function Check(
	props: NubeComponentCheckboxProps,
): NubeComponentCheckbox {
	return checkbox(props);
}

/**
 * Creates a `Checkbox` component.
 *
 * A `Check` represents a selectable field that can be toggled between checked and unchecked states.
 * It is typically used to allow users to select one or more options.
 * It supports properties such as `name`, `label`, `checked`, and event handlers (`onChange`).
 *
 * @param props - The properties for configuring the check component.
 * @returns A `NubeComponentCheckbox` object representing the check component.
 */
export function Checkbox(
	props: NubeComponentCheckboxProps,
): NubeComponentCheckbox {
	return checkbox(props);
}

/**
 * @deprecated This component has been deprecated since version `0.8.0`. Please use the `Textarea` component instead.
 */
export function Txtarea(
	props: NubeComponentTextareaProps,
): NubeComponentTextarea {
	return textarea(props);
}

/**
 * Creates a `Textarea` component.
 *
 * A `Textarea` represents a multi-line text input field that allows users to enter longer texts.
 * It supports properties such as `name`, `value`, and event handlers (`onChange`, `onBlur`, `onFocus`).
 *
 * @param props - The properties for configuring the textarea component.
 * @returns A `NubeComponentTextarea` object representing the textarea component.
 */
export function Textarea(
	props: NubeComponentTextareaProps,
): NubeComponentTextarea {
	return textarea(props);
}

/**
 * @deprecated This component has been deprecated since version `0.8.0`. Please use the `Image` component instead.
 */
export function Img(props: NubeComponentImageProps): NubeComponentImage {
	return image(props);
}

/**
 * Creates an `Img` (image) component.
 *
 * The `Img` component is used to display images. It supports properties such as
 * `src`, `alt`, `width`, `height`, and responsive `sources` for different screen sizes.
 *
 * @param props - The properties for configuring the image component.
 * @returns A `NubeComponentImg` object representing the image component.
 */
export function Image(props: NubeComponentImageProps): NubeComponentImage {
	return image(props);
}
