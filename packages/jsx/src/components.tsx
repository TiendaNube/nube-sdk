import type {
	NubeComponentBox,
	NubeComponentBoxProps,
	NubeComponentCol,
	NubeComponentColProps,
	NubeComponentField,
	NubeComponentFieldProps,
	NubeComponentFragment,
	NubeComponentFragmentProps,
	NubeComponentImg,
	NubeComponentImgProps,
	NubeComponentRow,
	NubeComponentRowProps,
	NubeComponentTxt,
	NubeComponentTxtProps,
} from "@tiendanube/nube-sdk-types";
import {
	box,
	col,
	field,
	fragment,
	img,
	row,
	txt,
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
 * Creates a `Col` (column) component.
 *
 * The `Col` component is a flexible column container used for structuring layouts.
 * It inherits most properties from `Box`, except for the `direction` property.
 *
 * @param props - The properties for configuring the column component.
 * @returns A `NubeComponentCol` object representing the column component.
 */
export function Col(props: NubeComponentColProps): NubeComponentCol {
	return col(props);
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
 * Creates a `Txt` (text) component.
 *
 * The `Txt` component is used to render text with optional styling.
 * It supports properties such as `color`, `background`, `heading` levels (h1-h6),
 * text formatting `modifiers` (bold, italic, etc.), and inline display.
 *
 * @param props - The properties for configuring the text component.
 * @returns A `NubeComponentTxt` object representing the text component.
 */
export function Txt(props: NubeComponentTxtProps): NubeComponentTxt {
	return txt(props);
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
export function Img(props: NubeComponentImgProps): NubeComponentImg {
	return img(props);
}
