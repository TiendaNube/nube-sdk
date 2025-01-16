import type {
	NubeComponentRow,
	NubeComponentRowProps,
} from "@tiendanube/nube-sdk-types";

export const row = (props: NubeComponentRowProps): NubeComponentRow => ({
	type: "row",
	...props,
});
