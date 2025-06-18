import type {
    NubeComponentAccordionHeader,
    NubeComponentAccordionHeaderProps,
} from "@tiendanube/nube-sdk-types";

/**
 * Creates an `accordion-header` component.
 *
 * An `accordion-header` represents the header of an accordion item.
 * It supports properties such as `children`.
 */
export const accordionHeader = (
	props: NubeComponentAccordionHeaderProps,
): NubeComponentAccordionHeader => ({
	type: "accordionHeader",
	...props,
});
