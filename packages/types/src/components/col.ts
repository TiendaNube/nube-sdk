import type { NubeComponentBoxProps } from "./box";
import type { NubeComponent } from "./types";

export type NubeComponentColProps = Omit<NubeComponentBoxProps, "direction">;

export type NubeComponentCol = NubeComponent &
	NubeComponentColProps & {
		type: "col";
	};
