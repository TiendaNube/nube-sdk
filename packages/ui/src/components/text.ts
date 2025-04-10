import type {
	NubeComponentText,
	NubeComponentTextProps,
} from "@tiendanube/nube-sdk-types";

/**
 * Creates a `txt` (text) component.
 *
 * The `txt` component is used to render text with optional styling.
 * It supports properties such as `color`, `background`, `heading` levels (h1-h6),
 * text formatting `modifiers` (bold, italic, etc.), and inline display.
 *
 * @param props - The properties for configuring the text component.
 * @returns A `NubeComponentTxt` object representing the text component.
 */
export const text = (props: NubeComponentTextProps): NubeComponentText => ({
	type: "txt",
	...props,
});

/**
 * @deprecated This component has been deprecated since version `0.8.0`. Please use the `text` component instead.
 */
export const txt = (props: NubeComponentTextProps): NubeComponentText => ({
	type: "txt",
	...props,
});
