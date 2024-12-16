import { Row, RowProps } from "@tiendanube/nube-sdk-types";

export const row = (props: RowProps): Row => ({
	type: "row",
	...props,
});
