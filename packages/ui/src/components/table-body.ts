import type {
	NubeComponentTableBody,
	NubeComponentTableBodyProps,
} from "@tiendanube/nube-sdk-types";
import { generateInternalId } from "./generateInternalId";

/**
 * Creates a `table` body component.
 *
 * A `table` body groups the rows that contain the data of a table.
 * It expects `tableRow` components as children.
 */
export const tableBody = (
	props: NubeComponentTableBodyProps,
): NubeComponentTableBody => ({
	type: "tableBody",
	...props,
	__internalId: generateInternalId("tableBody", props),
});
