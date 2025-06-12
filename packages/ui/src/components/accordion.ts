import type {
	NubeComponentAccordion,
	NubeComponentAccordionProps,
} from "@tiendanube/nube-sdk-types";

/**
 * Creates an `accordion` component.
 *
 * An `accordion` is a vertically stacked list of items that can be expanded or collapsed to reveal their content.
 * It supports properties such as `title`, `content`, `isExpanded`, and event handlers (`onToggle`).
 */
export const accordion = (
	props: NubeComponentAccordionProps,
): NubeComponentAccordion => ({
	type: "accordion",
	...props,
});
