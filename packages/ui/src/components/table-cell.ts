import type {
	NubeComponentTableCell,
	NubeComponentTableCellProps,
} from "@tiendanube/nube-sdk-types";
import { generateInternalId } from "./generateInternalId";

/**
 * Creates a `table` cell component.
 *
 * A `table` cell is a basic data cell of a table.
 * It supports properties such as `justify`, `width`, `minWidth`, `maxWidth`,
 * `colSpan`, `rowSpan` and custom styling.
 */
export const tableCell = (
	props: NubeComponentTableCellProps,
): NubeComponentTableCell => ({
	type: "tableCell",
	...props,
	__internalId: generateInternalId("tableCell", props),
});
