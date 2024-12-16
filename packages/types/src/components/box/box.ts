import type {
	ChildrenProps,
	NubeComponent,
	NubeComponentProps,
} from "../types";

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

export type TxtModifier =
	| "bold"
	| "italic"
	| "underline"
	| "strike"
	| "lowercase"
	| "uppercase"
	| "capitalize";

export type BoxProps = NubeComponentProps &
	ChildrenProps & {
		width?: Size;
		height?: Size;
		margin?: Size;
		padding?: Size;
		gap?: Size;
		direction?: "row" | "col";
		reverse?: boolean;
		background?: string;
		color?: string;
		justifyContent?: FlexContent;
		justifyItems?: FlexItems;
		alignItems?: FlexItems;
		alignContent?: FlexContent;
		borderRadius?: Size;
	};

export type Box = NubeComponent &
	BoxProps & {
		type: "box";
	};
