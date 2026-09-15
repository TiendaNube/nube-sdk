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
 *
 * The table can also be declared from raw data through `data` and `columns`.
 * When both are provided, `children` is ignored and the header and the body
 * are rendered from the data.
 */
export const tableRoot = (
	props: NubeComponentTableRootProps,
): NubeComponentTableRoot => {
	const isDataDriven = !!props.data && !!props.columns;
	const { children, ...rest } = props;

	return {
		type: "tableRoot",
		...(isDataDriven ? rest : props),
		__internalId: generateInternalId("tableRoot", props),
	};
};
