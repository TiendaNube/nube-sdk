import type { BoxProps } from "../box/box";
import type { NubeComponent } from "../types";

export type RowProps = Omit<BoxProps, "direction">;

export type Row = NubeComponent &
	RowProps & {
		type: "row";
	};
