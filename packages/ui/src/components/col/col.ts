import type { BoxProps } from "../box/box";
import type { NubeComponent } from "../types";

export type ColProps = Omit<BoxProps, "direction">;

export const col = (props: ColProps): NubeComponent => ({
  type: "col",
  ...props,
});
