import type { NubeComponentStyle } from "@tiendanube/nube-sdk-ui";
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
			style?: NubeComponentStyle;
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
		mask?: string;
		autoFocus?: boolean;
		style?: {
			container?: NubeComponentStyle;
			label?: NubeComponentStyle;
			input?: NubeComponentStyle;
		};
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
/*                           Accordion Component                              */
/* -------------------------------------------------------------------------- */

/**
 * Represents the properties available for an `accordion` component.
 */
export type NubeComponentAccordionRootProps = Prettify<
	NubeComponentBase &
		ChildrenProps &
		Partial<{
			defaultValue: string;
			style?: NubeComponentStyle;
		}>
>;

/**
 * Represents an `accordion` component, used for accordions.
 */
export type NubeComponentAccordionRoot = Prettify<
	NubeComponentBase &
		NubeComponentAccordionRootProps & { type: "accordionRoot" }
>;

/* -------------------------------------------------------------------------- */
/*                        Accordion Header Component                          */
/* -------------------------------------------------------------------------- */

/**
 * Represents the properties available for an `accordion` header component.
 */
export type NubeComponentAccordionHeaderProps = Prettify<
	NubeComponentBase &
		ChildrenProps & {
			style?: NubeComponentStyle;
			showIcon?: boolean;
		}
>;

/**
 * Represents an `accordion` header component, used for accordion headers.
 */
export type NubeComponentAccordionHeader = Prettify<
	NubeComponentBase &
		NubeComponentAccordionHeaderProps & { type: "accordionHeader" }
>;

/* -------------------------------------------------------------------------- */
/*                            Accordion Content Component                     */
/* -------------------------------------------------------------------------- */

/**
 * Represents the properties available for an `accordion` content component.
 */
export type NubeComponentAccordionContentProps = Prettify<
	NubeComponentBase & ChildrenProps
>;

/**
 * Represents an `accordion` content component, used for accordion content.
 */
export type NubeComponentAccordionContent = Prettify<
	NubeComponentBase &
		NubeComponentAccordionContentProps & { type: "accordionContent" }
>;

/* -------------------------------------------------------------------------- */
/*                            Accordion Item Component                        */
/* -------------------------------------------------------------------------- */

/**
 * Represents the event handler for Accordion Item component
 */
export type NubeComponentAccordionItemEventHandler = NubeComponentEventHandler<
	"click",
	string
>;

/**
 * Represents the properties available for an `accordion` item component.
 */
export type NubeComponentAccordionItemProps = Prettify<
	NubeComponentBase &
		ChildrenProps & {
			value: string;
			onToggle?: NubeComponentAccordionItemEventHandler;
		}
>;

/**
 * Represents an `accordion` item component, used for accordion items.
 */
export type NubeComponentAccordionItem = Prettify<
	NubeComponentBase &
		NubeComponentAccordionItemProps & { type: "accordionItem" }
>;

/* -------------------------------------------------------------------------- */
/*                            Select Component                                */
/* -------------------------------------------------------------------------- */

export type NubeComponentSelectEventHandler = NubeComponentEventHandler<
	"change",
	string
>;

/**
 * Represents the properties available for a `select` component.
 */
export type NubeComponentSelectProps = Prettify<
	NubeComponentBase & {
		name: string;
		label: string;
		value?: string;
		style?: {
			label?: NubeComponentStyle;
			select?: NubeComponentStyle;
		};
		options: { label: string; value: string }[];
		onChange?: NubeComponentSelectEventHandler;
	}
>;

/**
 * Represents a `select` component, used for select inputs.
 */
export type NubeComponentSelect = Prettify<
	NubeComponentBase &
		NubeComponentSelectProps & {
			type: "select";
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
			style?: NubeComponentStyle;
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
		style?: {
			container?: NubeComponentStyle;
			label?: NubeComponentStyle;
			checkbox?: NubeComponentStyle;
		};
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
		mask?: string;
		autoFocus?: boolean;
		onChange?: NubeComponentTextareaEventHandler;
		onBlur?: NubeComponentTextareaEventHandler;
		onFocus?: NubeComponentTextareaEventHandler;
		style?: {
			container?: NubeComponentStyle;
			label?: NubeComponentStyle;
			input?: NubeComponentStyle;
		};
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
		style?: NubeComponentStyle;
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
		style?: NubeComponentStyle;
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
/*                          Toast Component                                   */
/* -------------------------------------------------------------------------- */

export type NubeComponentToastVariant =
	| "success"
	| "error"
	| "warning"
	| "info";

/**
 * Represents the properties available for a `toast` root component.
 */
export type NubeComponentToastRootProps = Prettify<
	NubeComponentBase &
		ChildrenProps & {
			variant?: NubeComponentToastVariant;
			duration?: number;
			style?: NubeComponentStyle;
		}
>;

/**
 * Represents a `toast` root component, used for toasts.
 */
export type NubeComponentToastRoot = Prettify<
	NubeComponentBase &
		NubeComponentToastRootProps & {
			type: "toastRoot";
		}
>;

/**
 * Represents the properties available for a `toast` title component.
 */
export type NubeComponentToastTitleProps = Prettify<
	NubeComponentBase &
		ChildrenProps & {
			style?: NubeComponentStyle;
		}
>;

/**
 * Represents a `toast` title component, used for toast titles.
 */
export type NubeComponentToastTitle = Prettify<
	NubeComponentBase &
		NubeComponentToastTitleProps & {
			type: "toastTitle";
		}
>;

/**
 * Represents the properties available for a `toast` description component.
 */
export type NubeComponentToastDescriptionProps = Prettify<
	NubeComponentBase &
		ChildrenProps & {
			style?: NubeComponentStyle;
		}
>;

/**
 * Represents a `toast` description component, used for toast descriptions.
 */
export type NubeComponentToastDescription = Prettify<
	NubeComponentBase &
		NubeComponentToastDescriptionProps & {
			type: "toastDescription";
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
/*                           Icon Component                                   */
/* -------------------------------------------------------------------------- */

export type NubeComponentIconName =
	| "infinite"
	| "peso"
	| "pix"
	| "accordion"
	| "align-center"
	| "align-left"
	| "align-right"
	| "apps-list"
	| "apps"
	| "archive"
	| "arrow-left"
	| "arrow-right"
	| "arrows-horizontal"
	| "arrows-vertical"
	| "backspace"
	| "bag"
	| "barcode"
	| "bold"
	| "box-packed"
	| "box-unpacked"
	| "briefcase"
	| "browser-search"
	| "browser"
	| "calculator"
	| "calendar-days"
	| "calendar"
	| "camera"
	| "cash"
	| "cashier"
	| "chat-dots"
	| "check-circle"
	| "check"
	| "chevron-down"
	| "chevron-left"
	| "chevron-right"
	| "chevron-up"
	| "christ"
	| "clock"
	| "close"
	| "code"
	| "cog"
	| "color-palette"
	| "copy"
	| "credit-card"
	| "desktop"
	| "discount-circle"
	| "diskette"
	| "download"
	| "drag-dots"
	| "drag"
	| "drink"
	| "drop"
	| "drums"
	| "duplicate"
	| "ecosystem"
	| "edit"
	| "ellipsis"
	| "exclamation-circle"
	| "exclamation-triangle"
	| "external-link"
	| "eye-off"
	| "eye"
	| "file-alt"
	| "file"
	| "fingerprint"
	| "fire"
	| "flag"
	| "font"
	| "forbidden"
	| "generative-stars"
	| "gift-box"
	| "gift-card"
	| "glasses"
	| "globe"
	| "google"
	| "guitar"
	| "heart"
	| "history"
	| "home"
	| "id-card"
	| "info-circle"
	| "invoice"
	| "italic"
	| "life-ring"
	| "lightbulb"
	| "link-off"
	| "link"
	| "list"
	| "location"
	| "lock-open"
	| "lock"
	| "log-out"
	| "magic-wand"
	| "mail"
	| "marketing"
	| "mate"
	| "menu"
	| "meta"
	| "mobile"
	| "money"
	| "moon"
	| "notification"
	| "obelisk"
	| "online-store"
	| "ordered-list"
	| "paper-plane"
	| "pencil"
	| "picture"
	| "planet"
	| "play"
	| "plus-circle"
	| "printer"
	| "pyramid"
	| "qr-code"
	| "question-circle"
	| "real"
	| "redo"
	| "remove-format"
	| "repeat"
	| "rocket"
	| "scooter"
	| "search"
	| "share"
	| "shopping-cart"
	| "shot"
	| "size-height"
	| "size-width"
	| "sliders"
	| "star"
	| "stats"
	| "steps"
	| "sticky-note"
	| "stop"
	| "store"
	| "subcategory"
	| "sun"
	| "tag"
	| "telephone"
	| "text-size"
	| "tiendanube"
	| "tiktok"
	| "tools"
	| "transfer-peso"
	| "transfer-real"
	| "trash"
	| "truck"
	| "undo"
	| "university"
	| "upload"
	| "user-circle"
	| "user-group"
	| "user"
	| "vertical-stacks"
	| "volume"
	| "wallet"
	| "whatsapp";

/**
 * Represents the properties available for an `icon` component.
 */
export type NubeComponentIconProps = Prettify<
	NubeComponentBase & {
		name: NubeComponentIconName;
		size?: Size;
		color?: string;
	}
>;

/**
 * Represents an `icon` component, used for displaying icons.
 */
export type NubeComponentIcon = Prettify<
	NubeComponentBase & NubeComponentIconProps & { type: "icon" }
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
	| NubeComponentButton
	| NubeComponentSelect
	| NubeComponentAccordionRoot
	| NubeComponentAccordionItem
	| NubeComponentAccordionContent
	| NubeComponentAccordionHeader
	| NubeComponentToastRoot
	| NubeComponentToastTitle
	| NubeComponentToastDescription
	| NubeComponentIcon;

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
	| "before_payment_options" // Before the payment options in checkout.
	| "before_address_form" // Before the address form in checkout.
	| "before_billing_form" // Before the billing form in checkout.
	| "before_contact_form" // Before the contact form in checkout.
	| "modal_content" // Content of a modal dialog in checkout.
	| "after_line_items_price" // After the price of the line items in checkout.
	| "before_shipping_form" // Before the shipping form in checkout.
	| "after_shipping_form" // After the shipping form in checkout.
	| "corner_top_left" // Top left corner of the checkout page.
	| "corner_top_right" // Top right corner of the checkout page.
	| "corner_bottom_left" // Bottom left corner of the checkout page.
	| "corner_bottom_right"; // Bottom right corner of the checkout page.

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
