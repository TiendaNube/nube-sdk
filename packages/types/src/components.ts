import type { NubeSDKState } from "./main";
import type { Prettify } from "./utility";

/* -------------------------------------------------------------------------- */
/*                               Utility Types                                */
/* -------------------------------------------------------------------------- */

/**
 * Defines units for size measurements.
 */
export type SizeUnit = "em" | "rem" | "px" | "%";

/**
 * Represents a flexible size definition.
 * It can be a number, a string with a unit, or "auto".
 */
export type Size = `${number}${SizeUnit}` | number | "auto";

/**
 * Ensures URLs are secure by enforcing "https://".
 */
export type SecurityURL = `https://${string}`;

/**
 * Defines possible alignment values for flex container content.
 */
export type FlexContent =
	| "start"
	| "center"
	| "space-between"
	| "space-around"
	| "space-evenly";

/**
 * Defines possible alignment values for flex items.
 */
export type FlexItems = "start" | "center" | "end" | "stretch";

/* -------------------------------------------------------------------------- */
/*                            Box Component                                   */
/* -------------------------------------------------------------------------- */

/**
 * Represents the properties available for a `box` component.
 */
export type NubeComponentBoxProps = Prettify<
	NubeComponentProps &
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
		}>
>;

/**
 * Represents a `box` component, used as a layout container.
 */
export type NubeComponentBox = Prettify<
	NubeComponentBase &
		NubeComponentBoxProps & {
			type: "box";
		}
>;

/* -------------------------------------------------------------------------- */
/*                            Col Component                                   */
/* -------------------------------------------------------------------------- */

/**
 * Represents the properties available for a `col` component.
 * Inherits properties from `box`, excluding `direction`.
 */
export type NubeComponentColumnProps = Omit<NubeComponentBoxProps, "direction">;

/**
 * Represents a `column` component, used for column-based layouts.
 */
export type NubeComponentColumn = Prettify<
	NubeComponentBase &
		NubeComponentColumnProps & {
			type: "col";
		}
>;

/* -------------------------------------------------------------------------- */
/*                            Row Component                                   */
/* -------------------------------------------------------------------------- */

/**
 * Represents the properties available for a `row` component.
 * Inherits properties from `box`, excluding `direction`.
 */
export type NubeComponentRowProps = Omit<NubeComponentBoxProps, "direction">;

/**
 * Represents a `row` component, used for row-based layouts.
 */
export type NubeComponentRow = Prettify<
	NubeComponentBase &
		NubeComponentRowProps & {
			type: "row";
		}
>;

/* -------------------------------------------------------------------------- */
/*                           Field Component                                  */
/* -------------------------------------------------------------------------- */

/**
 * Defines a handler for components with events.
 */
export type NubeComponentEventHandler<
	Events extends string,
	Value = string,
> = (data: {
	type: Events;
	state: NubeSDKState;
	value?: Value;
}) => void;

/**
 * Defines a handler for field-related events.
 */
export type NubeComponentFieldEventHandler = NubeComponentEventHandler<
	"change" | "focus" | "blur",
	string
>;

/**
 * Represents the properties available for a `field` component.
 */
export type NubeComponentFieldProps = Prettify<
	NubeComponentBase & {
		name: string;
		label: string;
		value?: string;
		onChange?: NubeComponentFieldEventHandler;
		onBlur?: NubeComponentFieldEventHandler;
		onFocus?: NubeComponentFieldEventHandler;
	}
>;

/**
 * Represents a `field` component, used for form inputs.
 */
export type NubeComponentField = Prettify<
	NubeComponentBase &
		NubeComponentFieldProps & {
			type: "field";
		}
>;

/* -------------------------------------------------------------------------- */
/*                          Button Component                                */
/* -------------------------------------------------------------------------- */

export type NubeComponentButtonEventHandler = NubeComponentEventHandler<
	"click",
	string
>;

/**
 * Represents the properties available for a `button` component.
 */
export type NubeComponentButtonProps = Prettify<
	NubeComponentBase &
		Partial<{
			children: string;
			disabled: boolean;
			variant: "primary" | "secondary" | "transparent" | "link";
			width: Size;
			height: Size;
			onClick: NubeComponentButtonEventHandler;
		}>
>;

/**
 * Represents a `button` component.
 */
export type NubeComponentButton = Prettify<
	NubeComponentBase &
		NubeComponentButtonProps & {
			type: "button";
		}
>;

/* -------------------------------------------------------------------------- */
/*                            Check Component                                 */
/* -------------------------------------------------------------------------- */

/**
 * Represents the event handler for Check component
 */
export type NubeComponentCheckEventHandler = NubeComponentEventHandler<
	"change",
	boolean
>;

/**
 * Represents the properties available for a `checkbox` component.
 */
export type NubeComponentCheckboxProps = Prettify<
	NubeComponentBase & {
		name: string;
		label: string;
		checked: boolean;
		onChange?: NubeComponentCheckEventHandler;
	}
>;

/**
 * Represents a `checkbox` component, used for checkboxs.
 */
export type NubeComponentCheckbox = Prettify<
	NubeComponentBase &
		NubeComponentCheckboxProps & {
			type: "check";
		}
>;

/* -------------------------------------------------------------------------- */
/*                          Textarea Component                                */
/* -------------------------------------------------------------------------- */

export type NubeComponentTextareaEventHandler = NubeComponentEventHandler<
	"change" | "focus" | "blur",
	string
>;

/**
 * Represents the properties available for a `textarea` component.
 */
export type NubeComponentTextareaProps = Prettify<
	NubeComponentBase & {
		name: string;
		label: string;
		maxLength?: number;
		row?: number;
		value?: string;
		onChange?: NubeComponentTextareaEventHandler;
		onBlur?: NubeComponentTextareaEventHandler;
		onFocus?: NubeComponentTextareaEventHandler;
	}
>;

/**
 * Represents a `textarea` component, used for textareas.
 */
export type NubeComponentTextarea = Prettify<
	NubeComponentBase &
		NubeComponentTextareaProps & {
			type: "txtarea";
		}
>;

/* -------------------------------------------------------------------------- */
/*                           Image Component                                  */
/* -------------------------------------------------------------------------- */

/**
 * Represents an image source with optional media conditions.
 */
export type ImageSource = {
	src: string;
	media?: string;
};

/**
 * Represents the properties available for an `image` component.
 */
export type NubeComponentImageProps = Prettify<
	NubeComponentBase & {
		src: string;
		alt: string;
		sources?: ImageSource[];
		width?: Size;
		height?: Size;
	}
>;

/**
 * Represents an `image` component, used to display images.
 */
export type NubeComponentImage = Prettify<
	NubeComponentBase &
		NubeComponentImageProps & {
			type: "img";
		}
>;

/* -------------------------------------------------------------------------- */
/*                           Txt Component                                    */
/* -------------------------------------------------------------------------- */

/**
 * Defines possible text formatting modifiers.
 */
export type TxtModifier =
	| "bold"
	| "italic"
	| "underline"
	| "strike"
	| "lowercase"
	| "uppercase"
	| "capitalize";

/**
 * Represents the properties available for a `text` component.
 */
export type NubeComponentTextProps = Prettify<
	NubeComponentBase & {
		color?: string;
		background?: string;
		heading?: 1 | 2 | 3 | 4 | 5 | 6;
		modifiers?: TxtModifier[];
		inline?: boolean;
		children?: NubeComponent | NubeComponent[] | string;
	}
>;

/**
 * Represents a `text` component, used for displaying text with formatting options.
 */
export type NubeComponentText = Prettify<
	NubeComponentBase &
		NubeComponentTextProps & {
			type: "txt";
		}
>;

/* -------------------------------------------------------------------------- */
/*                          Fragment Component                                */
/* -------------------------------------------------------------------------- */

/**
 * Represents the properties available for a `fragment` component.
 */
export type NubeComponentFragmentProps = Prettify<
	NubeComponentBase & ChildrenProps
>;

/**
 * Represents a `fragment` component, used as a logical grouping element.
 */
export type NubeComponentFragment = Prettify<
	NubeComponentFragmentProps & {
		type: "fragment";
	}
>;

/* -------------------------------------------------------------------------- */
/*                         Basic Definitions                                  */
/* -------------------------------------------------------------------------- */

/**
 * Represents a unique identifier for a UI component.
 */
export type NubeComponentId = string;

/**
 * Defines basic properties for all UI components.
 */
export type NubeComponentProps = {
	id?: NubeComponentId;
	// DON'T USE THIS, USED INTERNALLY BY THE SDK, ANY VALUE PASSED HERE WILL BE OVERWRITTEN
	__internalId?: NubeComponentId;
};

/**
 * Defines the base structure for all UI components.
 */
export type NubeComponentBase = NubeComponentProps;

/**
 * Defines components that can have child elements.
 */
export type ChildrenProps = {
	children?: NubeComponent | NubeComponent[];
};

/**
 * Represents any valid Nube component type.
 */
export type NubeComponent =
	| string
	| NubeComponentBox
	| NubeComponentColumn
	| NubeComponentRow
	| NubeComponentField
	| NubeComponentFragment
	| NubeComponentImage
	| NubeComponentText
	| NubeComponentCheckbox
	| NubeComponentTextarea
	| NubeComponentButton;

/**
 * Represents components that can contain other components as children.
 */
export type NubeComponentWithChildren =
	| NubeComponentBox
	| NubeComponentColumn
	| NubeComponentRow;

/**
 * Represents a UI slot where components can be dynamically injected.
 */
export type UISlot =
	| "before_main_content" // Before the main checkout content.
	| "after_main_content" // After the main checkout content.
	| "before_line_items" // Before the list of items in the cart.
	| "after_line_items" // After the list of items in the cart.
	| "after_contact_form" // After the contact form in checkout.
	| "after_address_form" // After the address form in checkout.
	| "after_billing_form" // After the billing form in checkout.
	| "after_payment_options" // After the payment options in checkout.
	| "before_address_form" // Before the address form in checkout.
	| "before_billing_form" // Before the billing form in checkout.
	| "before_contact_form" // Before the contact form in checkout.
	| "modal_content" // Content of a modal dialog in checkout.
	| "after_line_items_price"; // After the price of the line items in checkout.

/**
 * Represents the value of a UI component, typically used for form inputs.
 */
export type UIValue = string;

/**
 * Represents a mapping of UI slots to their respective components.
 */
export type UISlots = Partial<Record<UISlot, NubeComponent>>;

/**
 * Represents a mapping of UI component IDs to their respective values.
 */
export type UIValues = Record<NubeComponentId, UIValue>;

/**
 * Represents the UI state, including dynamically injected components and their values.
 */
export type UI = {
	/**
	 * Contains dynamically injected components into specific UI slots.
	 */
	slots: UISlots;

	/**
	 * Stores values associated with specific UI components, typically form inputs.
	 */
	values: UIValues;
};
