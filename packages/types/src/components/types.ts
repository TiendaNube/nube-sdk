import type { NubeSDKState } from "../main";

// ----------------------------
// ---- Box Component ---------
// ----------------------------
export type SizeUnit = "em" | "rem" | "px" | "%";
export type Size = `${number}${SizeUnit}` | number | "auto";
export type SecurityURL = `https://${string}`;
export type FlexContent =
	| "start"
	| "center"
	| "space-between"
	| "space-around"
	| "space-evenly";
export type FlexItems = "start" | "center" | "end" | "stretch";

export type NubeComponentBoxProps = NubeComponentProps &
	ChildrenProps &
	Partial<{
		width: Size;
		height: Size;
		margin: Size;
		padding: Size;
		gap: Size;
		direction: "row" | "col";
		reverse: boolean;
		background: string;
		color: string;
		justifyContent: FlexContent;
		alignItems: FlexItems;
		alignContent: FlexContent;
		borderRadius: Size;
	}>;

export type NubeComponentBox = NubeComponentBase &
	NubeComponentBoxProps & {
		type: "box";
	};

// ----------------------------
// ---- Col Component ---------
// ----------------------------
export type NubeComponentColProps = Omit<NubeComponentBoxProps, "direction">;

export type NubeComponentCol = NubeComponentBase &
	NubeComponentColProps & {
		type: "col";
	};

// ----------------------------
// ---- Row Component ---------
// ----------------------------
export type NubeComponentRowProps = Omit<NubeComponentBoxProps, "direction">;

export type NubeComponentRow = NubeComponentBase &
	NubeComponentRowProps & {
		type: "row";
	};

// ----------------------------
// ---- Field Component -------
// ----------------------------
export type NubeComponentFieldEventHandler = (data: {
	type: "change" | "blur" | "focus";
	state: NubeSDKState;
	value?: UIValue;
}) => void;

export type NubeComponentFieldProps = NubeComponentBase & {
	name: string;
	label: string;
	onChange?: NubeComponentFieldEventHandler;
	onBlur?: NubeComponentFieldEventHandler;
	onFocus?: NubeComponentFieldEventHandler;
};

export type NubeComponentField = NubeComponentBase &
	NubeComponentFieldProps & {
		type: "field";
	};

// ----------------------------
// ---- Image Component -------
// ----------------------------
export type ImageSource = {
	src: string;
	media?: string;
};

export type NubeComponentImgProps = NubeComponentBase & {
	src: string;
	alt: string;
	sources?: ImageSource[];
	width?: Size;
	height?: Size;
};

export type NubeComponentImg = NubeComponentBase &
	NubeComponentImgProps & {
		type: "img";
	};

// ----------------------------
// ---- Txt Component -------
// ----------------------------
export type TxtModifier =
	| "bold"
	| "italic"
	| "underline"
	| "strike"
	| "lowercase"
	| "uppercase"
	| "capitalize";

export type NubeComponentTxtProps = NubeComponentBase &
	ChildrenProps & {
		color?: string;
		background?: string;
		heading?: 1 | 2 | 3 | 4 | 5 | 6;
		modifiers?: TxtModifier[];
		inline?: boolean;
		children: string;
	};

export type NubeComponentTxt = NubeComponentBase &
	NubeComponentTxtProps & {
		type: "txt";
	};

// ----------------------------
// ---- Basic Definitions -----
// ----------------------------
export type NubeComponentId = string;

export type NubeComponentProps = {
	id?: NubeComponentId;
	// DON'T USE THIS, USED INTERNALLY BY THE SDK, ANY VALUE PASSED HERE WILL BE OVERWRITTEN
	__internalId?: NubeComponentId;
};

export type NubeComponentBase = NubeComponentProps;

export type ChildrenProps = {
	children?: NubeComponent | NubeComponent[];
};

export type NubeComponent =
	| string
	| NubeComponentBox
	| NubeComponentCol
	| NubeComponentRow
	| NubeComponentField
	| NubeComponentImg
	| NubeComponentTxt;

export type NubeComponentWithChildren =
	| NubeComponentBox
	| NubeComponentCol
	| NubeComponentRow;

export type UISlot =
	| "before_main_content"
	| "after_main_content"
	| "before_line_items"
	| "after_line_items"
	| "after_contact_form"
	| "after_address_form"
	| "after_billing_form";

export type UIValue = string;
export type UISlots = Partial<Record<UISlot, NubeComponent>>;
export type UIValues = Record<NubeComponentId, UIValue>;

export type UI = {
	slots: UISlots;
	values: UIValues;
};
