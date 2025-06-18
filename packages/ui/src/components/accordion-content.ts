import type {
	NubeComponentAccordionContent,
	NubeComponentAccordionContentProps,
} from "@tiendanube/nube-sdk-types";

/**
 * Creates an `accordion-content` component.
 *
 * An `accordion-content` represents the content of an accordion item.
 * It supports properties such as `children`.
 */
export const accordionContent = (
	props: NubeComponentAccordionContentProps,
): NubeComponentAccordionContent => ({
	type: "accordionContent",
	...props,
});
