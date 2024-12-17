import type {
	NubeComponentField,
	NubeComponentFieldProps,
} from "@tiendanube/nube-sdk-types";

export const field = (props: NubeComponentFieldProps): NubeComponentField => ({
	type: "field",
	...props,
});
