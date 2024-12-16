import type { Field, FieldProps } from "@tiendanube/nube-sdk-types";

export const field = (props: FieldProps): Field => ({
	type: "field",
	...props,
});
