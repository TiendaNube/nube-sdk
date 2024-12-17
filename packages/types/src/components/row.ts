import type { NubeComponentBoxProps } from "./box";
import type { NubeComponent } from "./types";

export type NubeComponentRowProps = Omit<NubeComponentBoxProps, "direction">;

export type NubeComponentRow = NubeComponent &
	NubeComponentRowProps & {
		type: "row";
	};
