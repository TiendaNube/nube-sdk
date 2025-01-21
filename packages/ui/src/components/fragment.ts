import type {
	NubeComponentFragment,
	NubeComponentFragmentProps,
} from "@tiendanube/nube-sdk-types";

export const fragment = (
	props: NubeComponentFragmentProps,
): NubeComponentFragment => ({
	type: "fragment",
	...props,
});
