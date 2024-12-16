import type { BoxProps } from "../box/box";
import type { NubeComponent } from "../types";

export type ColProps = Omit<BoxProps, "direction">;

export type Col = NubeComponent &
	ColProps & {
		type: "col";
	};
