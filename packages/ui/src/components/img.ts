import type {
	NubeComponentImg,
	NubeComponentImgProps,
} from "@tiendanube/nube-sdk-types";

/**
 * Creates an `img` (image) component.
 *
 * The `img` component is used to display images. It supports properties such as
 * `src`, `alt`, `width`, `height`, and responsive `sources` for different screen sizes.
 *
 * @param props - The properties for configuring the image component.
 * @returns A `NubeComponentImg` object representing the image component.
 */
export const img = (props: NubeComponentImgProps): NubeComponentImg => ({
	type: "img",
	...props,
});
