import type {
	NubeComponentTableRowHeaderCell,
	NubeComponentTableRowHeaderCellProps,
} from "@tiendanube/nube-sdk-types";
import { generateInternalId } from "./generateInternalId";

/**
 * Creates a `table` row header cell component.
 *
 * A `table` row header cell is the heading of a row of a table and is
 * usually the first cell of a row of a `tableBody`.
 * It supports the same properties as a `tableCell`.
 */
export const tableRowHeaderCell = (
	props: NubeComponentTableRowHeaderCellProps,
): NubeComponentTableRowHeaderCell => ({
	type: "tableRowHeaderCell",
	...props,
	__internalId: generateInternalId("tableRowHeaderCell", props),
});
