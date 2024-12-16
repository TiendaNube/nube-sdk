import type { BoxProps } from "../box/box";

export type ColProps = Omit<BoxProps, "direction">;

export type Col = ColProps & {
	type: "col";
};
