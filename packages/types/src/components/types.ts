export type NubeComponentId = string;

export type NubeComponentProps = {
	id?: NubeComponentId;
	// DON'T USE THIS, USED INTERNALLY BY THE SDK, ANY VALUE PASSED HERE WILL BE OVERWRITTEN
	__internalId?: NubeComponentId;
};

export type ChildrenProps = {
	children: NubeComponent[];
};

export type NubeComponent = NubeComponentProps & {
	type: string;
	[key: string]: unknown;
};

export type UISlot =
	| "before_main_content"
	| "after_main_content"
	| "before_line_items"
	| "after_line_items";

export type UIValue = string;
export type UISlots = Record<UISlot, NubeComponent>;
export type UIValues = Record<NubeComponentId, UIValue>;

export type UI = {
	slots: UISlots;
	values: UIValues;
};
