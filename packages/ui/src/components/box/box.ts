import type { Box, BoxProps } from "@tiendanube/nube-sdk-types";

export const box = (props: BoxProps): Box => ({
	type: "box",
	...props,
});
