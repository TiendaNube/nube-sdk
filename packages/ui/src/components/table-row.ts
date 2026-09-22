import type {
	NubeComponentTableRow,
	NubeComponentTableRowProps,
} from "@tiendanube/nube-sdk-types";
import { generateInternalId } from "./generateInternalId";

/**
 * Creates a `table` row component.
 *
 * A `table` row groups the cells of a single row of a table.
 * It supports the `align` property to control the vertical alignment of its cells.
 */
export const tableRow = (
	props: NubeComponentTableRowProps,
): NubeComponentTableRow => ({
	type: "tableRow",
	...props,
	__internalId: generateInternalId("tableRow", props),
});
