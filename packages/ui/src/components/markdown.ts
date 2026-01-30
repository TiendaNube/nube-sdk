import type {
	NubeComponentMarkdown,
	NubeComponentMarkdownProps,
} from "@tiendanube/nube-sdk-types";
import { generateInternalId } from "./generateInternalId";

/**
 * Creates a `markdown` component.
 *
 * The `markdown` component is used to render markdown content.
 * It supports properties such as `content` for the markdown string.
 *
 * @param props - The properties for configuring the markdown component.
 * @returns A `NubeComponentMarkdown` object representing the markdown component.
 */
export const markdown = (
	props: NubeComponentMarkdownProps,
): NubeComponentMarkdown => ({
	type: "markdown",
	...props,
	__internalId: generateInternalId("markdown", props),
});
