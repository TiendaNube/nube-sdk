import type {
	NubeComponentIframe,
	NubeComponentIframeProps,
} from "@tiendanube/nube-sdk-types";
import { generateInternalId } from "./generateInternalId";

/**
 * Creates an `iframe` component.
 *
 * The `iframe` component is used to embed external content. It supports properties such as
 * `src`, `width`, `height`, `sandbox`, and `style`.
 *
 * @param props - The properties for configuring the iframe component.
 * @returns A `NubeComponentIframe` object representing the iframe component.
 */
export const iframe = (
	props: NubeComponentIframeProps,
): NubeComponentIframe => ({
	type: "iframe",
	...props,
	__internalId: generateInternalId("iframe", props),
});
