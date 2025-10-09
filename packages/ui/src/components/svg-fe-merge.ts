import type {
	NubeComponentFeMerge,
	NubeComponentFeMergeProps,
} from "@tiendanube/nube-sdk-types";
import { generateInternalId } from "./generateInternalId";

/**
 * Creates a `svgFeMerge` component.
 *
 * A `svgFeMerge` is a filter primitive that merges multiple input images together.
 * It can contain feMergeNode elements that specify the input sources to be merged
 * in order, creating composite effects from multiple filter operations.
 *
 * @param props - The properties for configuring the svgFeMerge component.
 * @returns A `NubeComponentFeMerge` object representing the svgFeMerge component.
 */
export const svgFeMerge = (
	props: NubeComponentFeMergeProps,
): NubeComponentFeMerge => ({
	type: "svgFeMerge",
	...props,
	__internalId: generateInternalId("svgFeMerge", props),
});
