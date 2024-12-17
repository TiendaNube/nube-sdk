import type {
	NubeComponent,
	NubeComponentProps,
	NubeSDKState,
	UIValue,
} from "@tiendanube/nube-sdk-types";

export type NubeComponentFieldEventHandler = (data: {
	type: "change" | "blur" | "focus";
	state: NubeSDKState;
	value?: UIValue;
}) => void;

export type NubeComponentFieldProps = NubeComponentProps & {
	name: string;
	label: string;
	onchange?: NubeComponentFieldEventHandler;
	onblur?: NubeComponentFieldEventHandler;
	onfocus?: NubeComponentFieldEventHandler;
};

export type NubeComponentField = NubeComponent &
	NubeComponentFieldProps & {
		type: "field";
	};
