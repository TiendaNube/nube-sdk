import type {
	NubeSDKState,
} from "@tiendanube/nube-sdk-types";

export type FieldEventHandler = (data: {
	type: string;
	state: NubeSDKState;
	value?: string;
}) => void;

export type FieldProps = {
	name: string;
	label: string;
	onchange?: FieldEventHandler;
	onblur?: FieldEventHandler;
	onfocus?: FieldEventHandler;
};

export type Field = FieldProps & {
	type: "field";
};
