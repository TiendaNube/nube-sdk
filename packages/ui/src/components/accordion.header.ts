import type {
	NubeComponentAccordionHeader,
	NubeComponentAccordionHeaderProps,
} from "@tiendanube/nube-sdk-types";
import { generateInternalId } from "./generateInternalId";
import { scopedClassNameProp } from "./scopedClassNameProp";

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
	...scopedClassNameProp(props.className),
	__internalId: generateInternalId("accordionHeader", props),
});
