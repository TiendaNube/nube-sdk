import type { BoxProps } from "../box/box";
import type { NubeComponent } from "../types";

export type RowProps = Omit<BoxProps, "direction">;

export const row = (props: RowProps): NubeComponent => ({
  type: "row",
  ...props,
});
