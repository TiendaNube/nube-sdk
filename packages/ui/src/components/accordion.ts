import type {
	NubeComponentAccordionRoot,
	NubeComponentAccordionRootProps,
} from "@tiendanube/nube-sdk-types";

/**
 * Creates an `accordion` component.
 *
 * An `accordion` is a vertically stacked list of items that can be expanded or collapsed to reveal their content.
 * It supports properties such as `defaultValue` for controlling which item is expanded by default, and custom styling.
 */
export const accordionRoot = (
	props: NubeComponentAccordionRootProps,
): NubeComponentAccordionRoot => ({
	type: "accordionRoot",
	...props,
});
