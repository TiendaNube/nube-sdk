import type {
	NubeComponentTableColumnHeaderCell,
	NubeComponentTableColumnHeaderCellProps,
} from "@tiendanube/nube-sdk-types";
import { generateInternalId } from "./generateInternalId";

/**
 * Creates a `table` column header cell component.
 *
 * A `table` column header cell is the heading of a column of a table and
 * should be placed inside a row of a `tableHeader`.
 * It supports the same properties as a `tableCell`.
 */
export const tableColumnHeaderCell = (
	props: NubeComponentTableColumnHeaderCellProps,
): NubeComponentTableColumnHeaderCell => ({
	type: "tableColumnHeaderCell",
	...props,
	__internalId: generateInternalId("tableColumnHeaderCell", props),
});
