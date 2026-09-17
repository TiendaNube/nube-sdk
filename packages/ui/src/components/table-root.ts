import type {
	NubeComponentTableDataRow,
	NubeComponentTableRoot,
	NubeComponentTableRootProps,
} from "@tiendanube/nube-sdk-types";
import { generateInternalId } from "./generateInternalId";

/**
 * Creates a `table` root component.
 *
 * A `table` root is the wrapper that groups the header and the body of a table.
 * It supports properties such as `size`, `variant`, `layout` and custom styling.
 *
 * The table can also be declared from raw data through `data` and `columns`.
 * When both are provided, `children` is ignored and the header and the body
 * are rendered from the data. The `key` of each column is restricted to the
 * keys present in the rows of `data`.
 */
export const tableRoot = <T extends NubeComponentTableDataRow>(
	props: NubeComponentTableRootProps<T>,
): NubeComponentTableRoot<T> => {
	const isDataDriven = !!props.data && !!props.columns;
	const { children, ...rest } = props;

	return {
		type: "tableRoot",
		...(isDataDriven ? rest : props),
		__internalId: generateInternalId("tableRoot", props),
	};
};
