import type {
	NubeComponentTableHeader,
	NubeComponentTableHeaderProps,
} from "@tiendanube/nube-sdk-types";
import { generateInternalId } from "./generateInternalId";

/**
 * Creates a `table` header component.
 *
 * A `table` header groups the rows that contain the column headings of a table.
 * It expects `tableRow` components as children.
 */
export const tableHeader = (
	props: NubeComponentTableHeaderProps,
): NubeComponentTableHeader => ({
	type: "tableHeader",
	...props,
	__internalId: generateInternalId("tableHeader", props),
});
