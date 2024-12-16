import type { BoxProps } from "../box/box";

export type RowProps = Omit<BoxProps, "direction">;

export type Row = RowProps & {
	type: "row";
}
