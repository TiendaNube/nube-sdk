import type {
	NubeComponentCarouselIndicator,
	NubeComponentCarouselIndicatorGroup,
	NubeComponentCarouselIndicatorProps,
	NubeComponentCarouselItem,
	NubeComponentCarouselItemGroup,
	NubeComponentCarouselNextTrigger,
	NubeComponentCarouselPartProps,
	NubeComponentCarouselPrevTrigger,
	NubeComponentCarouselRoot,
	NubeComponentCarouselRootProps,
	NubeComponentCarouselTriggerProps,
} from "@tiendanube/nube-sdk-types";
import { generateInternalId } from "./generateInternalId";

/**
 * Creates a `carouselRoot` component.
 *
 * `Carousel.Root` is a collection the app lays out and the SDK moves: native
 * CSS scroll-snap handles swipe, inertia and snap on the main thread, and the
 * active item is exposed through `data-state` and CSS variables for `styled()`.
 * Contains a `Carousel.ItemGroup` and, optionally, triggers and indicators.
 *
 * The controlled `index` is left out of the internal id: the id is the
 * component's identity on the page, so a new `index` must move the same
 * carousel (scrolling to the item) instead of mounting a new one, which would
 * restart every video and jump without animating.
 *
 * @param props - The properties for configuring the carousel root component.
 * @returns A `NubeComponentCarouselRoot` object representing the carousel root.
 */
export const carouselRoot = (
	props: NubeComponentCarouselRootProps,
): NubeComponentCarouselRoot => {
	const { index: _index, ...identity } = props;
	return {
		type: "carouselRoot",
		...props,
		__internalId: generateInternalId("carouselRoot", identity),
	};
};

/**
 * Creates a `carouselItemGroup` component: the scroll container holding the
 * `Carousel.Item`s. Must be a child of `Carousel.Root`.
 *
 * @param props - The properties for configuring the item group component.
 * @returns A `NubeComponentCarouselItemGroup` object.
 */
export const carouselItemGroup = (
	props: NubeComponentCarouselPartProps,
): NubeComponentCarouselItemGroup => ({
	type: "carouselItemGroup",
	...props,
	__internalId: generateInternalId("carouselItemGroup", props),
});

/**
 * Creates a `carouselItem` component: one slide inside `Carousel.ItemGroup`.
 *
 * @param props - The properties for configuring the item component.
 * @returns A `NubeComponentCarouselItem` object.
 */
export const carouselItem = (
	props: NubeComponentCarouselPartProps,
): NubeComponentCarouselItem => ({
	type: "carouselItem",
	...props,
	__internalId: generateInternalId("carouselItem", props),
});

/**
 * Creates a `carouselPrevTrigger` component: moves to the previous item.
 *
 * @param props - The properties for configuring the trigger component.
 * @returns A `NubeComponentCarouselPrevTrigger` object.
 */
export const carouselPrevTrigger = (
	props: NubeComponentCarouselTriggerProps,
): NubeComponentCarouselPrevTrigger => ({
	type: "carouselPrevTrigger",
	...props,
	__internalId: generateInternalId("carouselPrevTrigger", props),
});

/**
 * Creates a `carouselNextTrigger` component: moves to the next item.
 *
 * @param props - The properties for configuring the trigger component.
 * @returns A `NubeComponentCarouselNextTrigger` object.
 */
export const carouselNextTrigger = (
	props: NubeComponentCarouselTriggerProps,
): NubeComponentCarouselNextTrigger => ({
	type: "carouselNextTrigger",
	...props,
	__internalId: generateInternalId("carouselNextTrigger", props),
});

/**
 * Creates a `carouselIndicatorGroup` component. Without children it renders one
 * indicator per reachable item.
 *
 * @param props - The properties for configuring the indicator group component.
 * @returns A `NubeComponentCarouselIndicatorGroup` object.
 */
export const carouselIndicatorGroup = (
	props: NubeComponentCarouselPartProps,
): NubeComponentCarouselIndicatorGroup => ({
	type: "carouselIndicatorGroup",
	...props,
	__internalId: generateInternalId("carouselIndicatorGroup", props),
});

/**
 * Creates a `carouselIndicator` component: jumps to item `index`.
 *
 * @param props - The properties for configuring the indicator component.
 * @returns A `NubeComponentCarouselIndicator` object.
 */
export const carouselIndicator = (
	props: NubeComponentCarouselIndicatorProps,
): NubeComponentCarouselIndicator => ({
	type: "carouselIndicator",
	...props,
	__internalId: generateInternalId("carouselIndicator", props),
});
