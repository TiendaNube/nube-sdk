import type {
	NubeComponent,
	NubeSDKSendableEvent,
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

export const field = (props: FieldProps): NubeComponent => {
	const id = crypto.randomUUID();
	const app = self.__APP_DATA__.id;
	const sdk = self.__SDK_INSTANCE__;
	const prefix: NubeSDKSendableEvent = `custom:${app}:field:${id}`;
	const { onchange, onblur, onfocus, ...opts } = props;
	const events = { onchange: false, onblur: false, onfocus: false };

	if (onchange && typeof onchange === "function") {
		events.onchange = true;
		const event: NubeSDKSendableEvent = `${prefix}:change`;
		sdk.on(event, (state) =>
			onchange({ type: "change", value: state.ui.values[id], state }),
		);
	}

	if (onblur && typeof onblur === "function") {
		events.onblur = true;
		const event: NubeSDKSendableEvent = `${prefix}:blur`;
		sdk.on(event, (state) =>
			onblur({ type: "blur", value: state.ui.values[id], state }),
		);
	}

	if (onfocus && typeof onfocus === "function") {
		events.onfocus = true;
		const event: NubeSDKSendableEvent = `${prefix}:focus`;
		sdk.on(event, (state) =>
			onfocus({ type: "focus", value: state.ui.values[id], state }),
		);
	}

	return {
		...opts,
		type: "field",
		events,
		id,
	};
};
