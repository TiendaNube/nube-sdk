import type {
	NubeComponentCol,
	NubeComponentColProps,
} from "@tiendanube/nube-sdk-types";

export const col = (props: NubeComponentColProps): NubeComponentCol => ({
	type: "col",
	...props,
});
