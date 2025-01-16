import type {
	NubeComponentImg,
	NubeComponentImgProps,
} from "@tiendanube/nube-sdk-types";

export const img = (props: NubeComponentImgProps): NubeComponentImg => ({
	type: "img",
	...props,
});
