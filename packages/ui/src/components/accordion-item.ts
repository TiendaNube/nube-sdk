import type {
	NubeComponentAccordionItem,
	NubeComponentAccordionItemProps,
} from "@tiendanube/nube-sdk-types";

/**
 * Creates an `accordion-item` component.
 *
 * An `accordion-item` represents a single item within an accordion.
 * Each item contains a header that can be clicked to show/hide its content.
 * It supports properties such as `title`, `content`, `isExpanded`, and event handlers (`onToggle`).
 */
export const accordionItem = (
	props: NubeComponentAccordionItemProps,
): NubeComponentAccordionItem => ({
	type: "accordionItem",
	...props,
});
