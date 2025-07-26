import type {
	NubeComponentFeGaussianBlur,
	NubeComponentFeGaussianBlurProps,
} from "@tiendanube/nube-sdk-types";

/**
 * Creates a `svgFeGaussianBlur` component.
 *
 * A `svgFeGaussianBlur` is a filter primitive that applies a Gaussian blur effect
 * to SVG graphics. It supports properties like stdDeviation (blur amount) and
 * edgeMode for handling edge pixels during blurring.
 *
 * @param props - The properties for configuring the svgFeGaussianBlur component.
 * @returns A `NubeComponentFeGaussianBlur` object representing the svgFeGaussianBlur component.
 */
export const svgFeGaussianBlur = (
	props: NubeComponentFeGaussianBlurProps,
): NubeComponentFeGaussianBlur => ({
	type: "svgFeGaussianBlur",
	...props,
});
