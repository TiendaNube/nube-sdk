import type {
	NubeComponentImage,
	NubeComponentImageProps,
} from "@tiendanube/nube-sdk-types";
import { generateInternalId } from "./generateInternalId";

/**
 * @deprecated This component has been deprecated since version `0.8.0`. Please use the `image` component instead.
 */
export const img = (props: NubeComponentImageProps): NubeComponentImage => ({
	type: "img",
	...props,
	__internalId: generateInternalId("img", props),
});

/**
 * Creates an `image` (image) component.
 *
 * The `image` component is used to display images. It supports properties such as
 * `src`, `alt`, `width`, `height`, and responsive `sources` for different screen sizes.
 *
 * @param props - The properties for configuring the image component.
 * @returns A `NubeComponentImage` object representing the image component.
 */
export const image = (props: NubeComponentImageProps): NubeComponentImage => ({
	type: "img",
	...props,
	__internalId: generateInternalId("img", props),
});
