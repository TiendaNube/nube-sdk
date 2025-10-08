import type {
	NubeComponentFeMergeNode,
	NubeComponentFeMergeNodeProps,
} from "@tiendanube/nube-sdk-types";
import { generateInternalId } from "./generateInternalId";

/**
 * Creates a `svgFeMergeNode` component.
 *
 * A `svgFeMergeNode` is used within feMerge elements to specify input sources
 * for merging operations. It supports the in property to reference the input
 * source that should be included in the merge operation.
 *
 * @param props - The properties for configuring the svgFeMergeNode component.
 * @returns A `NubeComponentFeMergeNode` object representing the svgFeMergeNode component.
 */
export const svgFeMergeNode = (
	props: NubeComponentFeMergeNodeProps,
): NubeComponentFeMergeNode => ({
	type: "svgFeMergeNode",
	...props,
	__internalId: generateInternalId("svgFeMergeNode", props),
});
