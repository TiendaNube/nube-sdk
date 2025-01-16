import type {
	NubeComponentTxt,
	NubeComponentTxtProps,
} from "@tiendanube/nube-sdk-types";

export const txt = (props: NubeComponentTxtProps): NubeComponentTxt => ({
	type: "txt",
	...props,
});
