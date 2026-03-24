import type {
	NubeComponentIframe,
	NubeComponentIframeProps,
} from "@tiendanube/nube-sdk-types";
import { generateInternalId } from "./generateInternalId";

/**
 * Creates an `iframe` component.
 *
 * Embeds external content. Supports `src`, `width`, `height`, `sandbox`, `style`,
 * `onMessage` (runtime receives child messages), and `autoresize` (host resizes the iframe
 * when the child posts `{ type: "resize", height?, width? }`).
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
