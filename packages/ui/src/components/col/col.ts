import type { Col, ColProps } from "@tiendanube/nube-sdk-types";

export const col = (props: ColProps): Col => ({
	type: "col",
	...props,
});
