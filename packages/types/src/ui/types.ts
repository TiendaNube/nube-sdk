export type SizeUnit = "em" | "rem" | "px" | "%";
export type Size = `${number}${SizeUnit}` | number | "auto";
export type SecurityURL = `https://${string}`;
export type FlexContent =
	| "start"
	| "center"
	| "space-between"
	| "space-arround"
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

export type NubeComponent = {
	type: string;
	[key: string]: unknown;
};

export type UISlot =
	| "before_main_content"
	| "after_main_content"
	| "before_line_items"
	| "after_line_items";

export type UIRender = Record<UISlot, NubeComponent>;
export type UIValue = Record<string, string>;
export type UI = UIRender & { values: UIValue };
