import type {
	NubeComponent,
	NubeComponentProps,
	NubeSDKState,
	UIValue,
} from "@tiendanube/nube-sdk-types";

export type FieldEventHandler = (data: {
	type: string;
	state: NubeSDKState;
	value?: UIValue;
}) => void;

export type FieldProps = NubeComponentProps & {
	name: string;
	label: string;
	onchange?: FieldEventHandler;
	onblur?: FieldEventHandler;
	onfocus?: FieldEventHandler;
};

export type Field = NubeComponent &
	FieldProps & {
		type: "field";
	};
