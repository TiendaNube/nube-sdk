import type {
	NubeComponentBox,
	NubeComponentBoxProps,
} from "@tiendanube/nube-sdk-types";

export const box = (props: NubeComponentBoxProps): NubeComponentBox => ({
	type: "box",
	...props,
});
