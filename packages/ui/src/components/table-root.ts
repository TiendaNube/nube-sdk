import type {
	NubeComponentTableRoot,
	NubeComponentTableRootProps,
} from "@tiendanube/nube-sdk-types";
import { generateInternalId } from "./generateInternalId";

/**
 * Creates a `table` root component.
 *
 * A `table` root is the wrapper that groups the header and the body of a table.
 * It supports properties such as `size`, `variant`, `layout` and custom styling.
 */
export const tableRoot = (
	props: NubeComponentTableRootProps,
): NubeComponentTableRoot => ({
	type: "tableRoot",
	...props,
	__internalId: generateInternalId("tableRoot", props),
});
