import type * as CSS from "csstype";
import type { NubeSDKState } from "./main";
import type { UISlot } from "./slots";
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

/**
 * Represents the range of opacity values for theme colors.
 */
export type ThemeColorOpacityRange =
	| 0
	| 5
	| 10
	| 20
	| 30
	| 40
	| 50
	| 60
	| 70
	| 80
	| 90;

/**
 * Represents a theme color class that can generate CSS custom properties.
 */
export interface ThemeColorInterface {
	opacity(opacity: ThemeColorOpacityRange): string;
	toValue(): string;
	toString(): string;
}

export type ThemeColorValue = string;
export type ThemeColorOpacityValue = string;

/**
 * Primitive CSS values that can be used in theme definitions.
 */
type ThemeCSSPrimitive = string | number;

/**
 * Represents values that can be used in theme-aware CSS properties.
 */
export type ThemeCSSValue =
	| ThemeColorInterface
	| ThemeColorOpacityValue
	| ThemeCSSPrimitive;

/**
 * Maps properties that should use the Size type
 */
type SizePropertyKeys =
	| "width"
	| "height"
	| "minWidth"
	| "minHeight"
	| "maxWidth"
	| "maxHeight"
	| "top"
	| "right"
	| "bottom"
	| "left"
	| "margin"
	| "marginTop"
	| "marginBottom"
	| "marginLeft"
	| "marginRight"
	| "padding"
	| "paddingTop"
	| "paddingBottom"
	| "paddingLeft"
	| "paddingRight"
	| "fontSize"
	| "lineHeight"
	| "borderWidth"
	| "borderRadius";

/**
 * Applies Size only to size properties.
 * The others remain as string | number.
 */
type EnhancedCSSProperties = {
	[K in keyof CSS.Properties]?: K extends SizePropertyKeys
		? Size | ThemeCSSValue
		: CSS.Properties[K] | ThemeCSSValue;
};

/**
 * Define named styles for Nube components.
 * This type combines CSS properties with theme-aware values and Size types for layout properties.
 */
export type NubeComponentStyle = Partial<EnhancedCSSProperties>;

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
> = (data: { type: Events; state: NubeSDKState; value?: Value }) => void;

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
/*                           NumberField Component                                */
/* -------------------------------------------------------------------------- */

export type NubeComponentNumberFieldEventHandler = NubeComponentEventHandler<
	"change" | "focus" | "blur" | "increment" | "decrement",
	string
>;

/**
 * Represents the properties available for a `numberfield` component.
 */
export type NubeComponentNumberFieldProps = Prettify<
	NubeComponentBase & {
		name: string;
		label: string;
		value?: number;
		min?: number;
		max?: number;
		step?: number;
		disabled?: boolean;
		style?: {
			container?: NubeComponentStyle;
			wrapper?: NubeComponentStyle;
			label?: NubeComponentStyle;
			input?: NubeComponentStyle;
			decrementButton?: NubeComponentStyle;
			incrementButton?: NubeComponentStyle;
		};
		onChange?: NubeComponentNumberFieldEventHandler;
		onBlur?: NubeComponentNumberFieldEventHandler;
		onFocus?: NubeComponentNumberFieldEventHandler;
		onIncrement?: NubeComponentNumberFieldEventHandler;
		onDecrement?: NubeComponentNumberFieldEventHandler;
	}
>;

/**
 * Represents a `numberfield` component, used for numeric form inputs with increment/decrement buttons.
 */
export type NubeComponentNumberField = Prettify<
	NubeComponentBase &
		NubeComponentNumberFieldProps & {
			type: "numberfield";
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
			children: NubeComponentChildren;
			disabled: boolean;
			variant: "primary" | "secondary" | "transparent" | "link";
			width: Size;
			height: Size;
			style?: NubeComponentStyle;
			onClick: NubeComponentButtonEventHandler;
			ariaLabel: string;
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
		children?: NubeComponentChildren;
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
/*                           SVG Components                                   */
/* -------------------------------------------------------------------------- */

/**
 * Represents the properties available for an `svg` component.
 */
export type NubeComponentSvgProps = Prettify<
	NubeComponentBase &
		ChildrenProps &
		Partial<{
			width: string | number;
			height: string | number;
			viewBox: string;
			version: string;
			fill: string;
			stroke: string;
			strokeWidth: number | string;
			preserveAspectRatio: string;
			style?: NubeComponentStyle;
			xmlns?: string;
		}>
>;

/**
 * Represents an `svg` component, used as the root container for SVG graphics.
 */
export type NubeComponentSvg = Prettify<
	NubeComponentBase &
		NubeComponentSvgProps & {
			type: "svgRoot";
		}
>;

/* -------------------------------------------------------------------------- */
/*                           Circle Component                                 */
/* -------------------------------------------------------------------------- */

/**
 * Represents the properties available for a `circle` component.
 */
export type NubeComponentCircleProps = Prettify<
	NubeComponentBase &
		Partial<{
			cx: number | string;
			cy: number | string;
			r: number | string;
			fill: string;
			stroke: string;
			strokeWidth: number | string;
			strokeDasharray: string;
			strokeDashoffset: number | string;
			strokeLinecap: "butt" | "round" | "square";
			strokeLinejoin: "miter" | "round" | "bevel";
			opacity: number;
			style?: NubeComponentStyle;
		}>
>;

/**
 * Represents a `circle` component, used for drawing circles in SVG.
 */
export type NubeComponentCircle = Prettify<
	NubeComponentBase &
		NubeComponentCircleProps & {
			type: "svgCircle";
		}
>;

/* -------------------------------------------------------------------------- */
/*                           Path Component                                   */
/* -------------------------------------------------------------------------- */

/**
 * Represents the properties available for a `path` component.
 */
export type NubeComponentPathProps = Prettify<
	NubeComponentBase &
		Partial<{
			d: string;
			fill: string;
			stroke: string;
			strokeWidth: number | string;
			strokeDasharray: string;
			strokeDashoffset: number | string;
			strokeLinecap: "butt" | "round" | "square";
			strokeLinejoin: "miter" | "round" | "bevel";
			fillRule: "nonzero" | "evenodd";
			opacity: number;
			style?: NubeComponentStyle;
		}>
>;

/**
 * Represents a `path` component, used for drawing custom paths in SVG.
 */
export type NubeComponentPath = Prettify<
	NubeComponentBase &
		NubeComponentPathProps & {
			type: "svgPath";
		}
>;

/* -------------------------------------------------------------------------- */
/*                           G Component                                      */
/* -------------------------------------------------------------------------- */

/**
 * Represents the properties available for a `g` component.
 */
export type NubeComponentGProps = Prettify<
	NubeComponentBase &
		ChildrenProps &
		Partial<{
			transform: string;
			opacity: number;
			style?: NubeComponentStyle;
			stroke: string;
			strokeWidth: number | string;
			strokeDasharray: string;
			strokeDashoffset: number | string;
			strokeLinecap: "butt" | "round" | "square";
			strokeLinejoin: "miter" | "round" | "bevel";
			fill: string;
		}>
>;

/**
 * Represents a `g` component, used for grouping SVG elements.
 */
export type NubeComponentG = Prettify<
	NubeComponentBase &
		NubeComponentGProps & {
			type: "svgG";
		}
>;

/* -------------------------------------------------------------------------- */
/*                           Rect Component                                   */
/* -------------------------------------------------------------------------- */

/**
 * Represents the properties available for a `rect` component.
 */
export type NubeComponentRectProps = Prettify<
	NubeComponentBase &
		Partial<{
			x: number | string;
			y: number | string;
			width: number | string;
			height: number | string;
			rx: number | string;
			ry: number | string;
			fill: string;
			stroke: string;
			strokeWidth: number | string;
			strokeDasharray: string;
			clipPath: string;
			strokeDashoffset: number | string;
			strokeLinecap: "butt" | "round" | "square";
			strokeLinejoin: "miter" | "round" | "bevel";
			opacity: number;
			style?: NubeComponentStyle;
		}>
>;

/**
 * Represents a `rect` component, used for drawing rectangles in SVG.
 */
export type NubeComponentRect = Prettify<
	NubeComponentBase &
		NubeComponentRectProps & {
			type: "svgRect";
		}
>;

/* -------------------------------------------------------------------------- */
/*                           Line Component                                   */
/* -------------------------------------------------------------------------- */

/**
 * Represents the properties available for a `line` component.
 */
export type NubeComponentLineProps = Prettify<
	NubeComponentBase &
		Partial<{
			x1: number | string;
			y1: number | string;
			x2: number | string;
			y2: number | string;
			stroke: string;
			strokeWidth: number | string;
			strokeDasharray: string;
			strokeDashoffset: number | string;
			strokeLinecap: "butt" | "round" | "square";
			opacity: number;
			style?: NubeComponentStyle;
		}>
>;

/**
 * Represents a `line` component, used for drawing lines in SVG.
 */
export type NubeComponentLine = Prettify<
	NubeComponentBase &
		NubeComponentLineProps & {
			type: "svgLine";
		}
>;

/* -------------------------------------------------------------------------- */
/*                           Ellipse Component                                */
/* -------------------------------------------------------------------------- */

/**
 * Represents the properties available for an `ellipse` component.
 */
export type NubeComponentEllipseProps = Prettify<
	NubeComponentBase &
		Partial<{
			cx: number | string;
			cy: number | string;
			rx: number | string;
			ry: number | string;
			fill: string;
			stroke: string;
			strokeWidth: number | string;
			strokeDasharray: string;
			strokeDashoffset: number | string;
			strokeLinecap: "butt" | "round" | "square";
			strokeLinejoin: "miter" | "round" | "bevel";
			opacity: number;
			style?: NubeComponentStyle;
		}>
>;

/**
 * Represents an `ellipse` component, used for drawing ellipses in SVG.
 */
export type NubeComponentEllipse = Prettify<
	NubeComponentBase &
		NubeComponentEllipseProps & {
			type: "svgEllipse";
		}
>;

/* -------------------------------------------------------------------------- */
/*                           Polygon Component                                */
/* -------------------------------------------------------------------------- */

/**
 * Represents the properties available for a `polygon` component.
 */
export type NubeComponentPolygonProps = Prettify<
	NubeComponentBase &
		Partial<{
			points: string;
			fill: string;
			stroke: string;
			strokeWidth: number | string;
			strokeDasharray: string;
			strokeDashoffset: number | string;
			strokeLinecap: "butt" | "round" | "square";
			strokeLinejoin: "miter" | "round" | "bevel";
			fillRule: "nonzero" | "evenodd";
			opacity: number;
			style?: NubeComponentStyle;
		}>
>;

/**
 * Represents a `polygon` component, used for drawing polygons in SVG.
 */
export type NubeComponentPolygon = Prettify<
	NubeComponentBase &
		NubeComponentPolygonProps & {
			type: "svgPolygon";
		}
>;

/* -------------------------------------------------------------------------- */
/*                           Polyline Component                               */
/* -------------------------------------------------------------------------- */

/**
 * Represents the properties available for a `polyline` component.
 */
export type NubeComponentPolylineProps = Prettify<
	NubeComponentBase &
		Partial<{
			points: string;
			fill: string;
			stroke: string;
			strokeWidth: number | string;
			strokeDasharray: string;
			strokeDashoffset: number | string;
			strokeLinecap: "butt" | "round" | "square";
			strokeLinejoin: "miter" | "round" | "bevel";
			opacity: number;
			style?: NubeComponentStyle;
		}>
>;

/**
 * Represents a `polyline` component, used for drawing polylines in SVG.
 */
export type NubeComponentPolyline = Prettify<
	NubeComponentBase &
		NubeComponentPolylineProps & {
			type: "svgPolyline";
		}
>;

/* -------------------------------------------------------------------------- */
/*                           Text Component                                   */
/* -------------------------------------------------------------------------- */

/**
 * Represents the properties available for a `text` component in SVG.
 */
export type NubeComponentSvgTextProps = Prettify<
	NubeComponentBase &
		Partial<{
			x: number | string;
			y: number | string;
			dx: number | string;
			dy: number | string;
			textAnchor: "start" | "middle" | "end";
			fontSize: number | string;
			fontFamily: string;
			fontWeight: string | number;
			fontStyle: "normal" | "italic" | "oblique";
			textDecoration: string;
			fill: string;
			stroke: string;
			strokeWidth: number | string;
			opacity: number;
			style?: NubeComponentStyle;
			children?: string;
			strokeDasharray: string;
			strokeDashoffset: number | string;
			strokeLinecap: "butt" | "round" | "square";
			strokeLinejoin: "miter" | "round" | "bevel";
		}>
>;

/**
 * Represents a `text` component in SVG, used for displaying text.
 */
export type NubeComponentSvgText = Prettify<
	NubeComponentBase &
		NubeComponentSvgTextProps & {
			type: "svgText";
		}
>;

/* -------------------------------------------------------------------------- */
/*                           TSpan Component                                  */
/* -------------------------------------------------------------------------- */

/**
 * Represents the properties available for a `tspan` component.
 */
export type NubeComponentTSpanProps = Prettify<
	NubeComponentBase &
		Partial<{
			x: number | string;
			y: number | string;
			dx: number | string;
			dy: number | string;
			fontSize: number | string;
			fontFamily: string;
			fontWeight: string | number;
			fontStyle: "normal" | "italic" | "oblique";
			fill: string;
			stroke: string;
			strokeWidth: number | string;
			opacity: number;
			style?: NubeComponentStyle;
			children?: string;
		}>
>;

/**
 * Represents a `tspan` component, used for text spans within SVG text.
 */
export type NubeComponentTSpan = Prettify<
	NubeComponentBase &
		NubeComponentTSpanProps & {
			type: "svgTspan";
		}
>;

/* -------------------------------------------------------------------------- */
/*                           Defs Component                                   */
/* -------------------------------------------------------------------------- */

/**
 * Represents the properties available for a `defs` component.
 */
export type NubeComponentDefsProps = Prettify<
	NubeComponentBase & ChildrenProps
>;

/**
 * Represents a `defs` component, used for defining reusable elements in SVG.
 */
export type NubeComponentDefs = Prettify<
	NubeComponentBase &
		NubeComponentDefsProps & {
			type: "svgDefs";
		}
>;

/* -------------------------------------------------------------------------- */
/*                           Stop Component                                   */
/* -------------------------------------------------------------------------- */

/**
 * Represents the properties available for a `stop` component.
 */
export type NubeComponentStopProps = Prettify<
	NubeComponentBase &
		Partial<{
			offset: number | string;
			stopColor: string;
			stopOpacity: number | string;
			style?: NubeComponentStyle;
		}>
>;

/**
 * Represents a `stop` component, used in gradients.
 */
export type NubeComponentStop = Prettify<
	NubeComponentBase &
		NubeComponentStopProps & {
			type: "svgStop";
		}
>;

/* -------------------------------------------------------------------------- */
/*                           LinearGradient Component                         */
/* -------------------------------------------------------------------------- */

/**
 * Represents the properties available for a `linearGradient` component.
 */
export type NubeComponentLinearGradientProps = Prettify<
	NubeComponentBase &
		ChildrenProps &
		Partial<{
			id: string;
			x1: number | string;
			y1: number | string;
			x2: number | string;
			y2: number | string;
			gradientUnits: "userSpaceOnUse" | "objectBoundingBox";
			gradientTransform: string;
			style?: NubeComponentStyle;
		}>
>;

/**
 * Represents a `linearGradient` component, used for linear gradients.
 */
export type NubeComponentLinearGradient = Prettify<
	NubeComponentBase &
		NubeComponentLinearGradientProps & {
			type: "svgLinearGradient";
		}
>;

/* -------------------------------------------------------------------------- */
/*                           RadialGradient Component                         */
/* -------------------------------------------------------------------------- */

/**
 * Represents the properties available for a `radialGradient` component.
 */
export type NubeComponentRadialGradientProps = Prettify<
	NubeComponentBase &
		ChildrenProps &
		Partial<{
			id: string;
			cx: number | string;
			cy: number | string;
			r: number | string;
			fx: number | string;
			fy: number | string;
			rx: number | string;
			ry: number | string;
			gradientUnits: "userSpaceOnUse" | "objectBoundingBox";
			gradientTransform: string;
			style?: NubeComponentStyle;
		}>
>;

/**
 * Represents a `radialGradient` component, used for radial gradients.
 */
export type NubeComponentRadialGradient = Prettify<
	NubeComponentBase &
		NubeComponentRadialGradientProps & {
			type: "svgRadialGradient";
		}
>;

/* -------------------------------------------------------------------------- */
/*                           Mask Component                                   */
/* -------------------------------------------------------------------------- */

/**
 * Represents the properties available for a `mask` component.
 */
export type NubeComponentMaskProps = Prettify<
	NubeComponentBase &
		ChildrenProps &
		Partial<{
			id: string;
			x: number | string;
			y: number | string;
			width: number | string;
			height: number | string;
			maskUnits: "userSpaceOnUse" | "objectBoundingBox";
			style?: NubeComponentStyle;
		}>
>;

/**
 * Represents a `mask` component, used for masking SVG elements.
 */
export type NubeComponentMask = Prettify<
	NubeComponentBase &
		NubeComponentMaskProps & {
			type: "svgMask";
		}
>;

/* -------------------------------------------------------------------------- */
/*                           ClipPath Component                               */
/* -------------------------------------------------------------------------- */

/**
 * Represents the properties available for a `clipPath` component.
 */
export type NubeComponentClipPathProps = Prettify<
	NubeComponentBase &
		ChildrenProps &
		Partial<{
			id: string;
			clipPathUnits: "userSpaceOnUse" | "objectBoundingBox";
			style?: NubeComponentStyle;
		}>
>;

/**
 * Represents a `clipPath` component, used for clipping SVG elements.
 */
export type NubeComponentClipPath = Prettify<
	NubeComponentBase &
		NubeComponentClipPathProps & {
			type: "svgClipPath";
		}
>;

/* -------------------------------------------------------------------------- */
/*                           Use Component                                    */
/* -------------------------------------------------------------------------- */

/**
 * Represents the properties available for a `use` component.
 */
export type NubeComponentUseProps = Prettify<
	NubeComponentBase &
		Partial<{
			href: string;
			x: number | string;
			y: number | string;
			width: number | string;
			height: number | string;
			transform: string;
			style?: NubeComponentStyle;
		}>
>;

/**
 * Represents a `use` component, used for reusing SVG elements.
 */
export type NubeComponentUse = Prettify<
	NubeComponentBase &
		NubeComponentUseProps & {
			type: "svgUse";
		}
>;

/* -------------------------------------------------------------------------- */
/*                           Symbol Component                                 */
/* -------------------------------------------------------------------------- */

/**
 * Represents the properties available for a `symbol` component.
 */
export type NubeComponentSymbolProps = Prettify<
	NubeComponentBase &
		ChildrenProps &
		Partial<{
			id: string;
			viewBox: string;
			preserveAspectRatio: string;
			style?: NubeComponentStyle;
		}>
>;

/**
 * Represents a `symbol` component, used for defining reusable symbols.
 */
export type NubeComponentSymbol = Prettify<
	NubeComponentBase &
		NubeComponentSymbolProps & {
			type: "svgSymbol";
		}
>;

/* -------------------------------------------------------------------------- */
/*                           Pattern Component                                */
/* -------------------------------------------------------------------------- */

/**
 * Represents the properties available for a `pattern` component.
 */
export type NubeComponentPatternProps = Prettify<
	NubeComponentBase &
		ChildrenProps &
		Partial<{
			id: string;
			x: number | string;
			y: number | string;
			width: number | string;
			height: number | string;
			patternUnits: "userSpaceOnUse" | "objectBoundingBox";
			patternTransform: string;
			viewBox: string;
			style?: NubeComponentStyle;
		}>
>;

/**
 * Represents a `pattern` component, used for creating patterns.
 */
export type NubeComponentPattern = Prettify<
	NubeComponentBase &
		NubeComponentPatternProps & {
			type: "svgPattern";
		}
>;

/* -------------------------------------------------------------------------- */
/*                           Filter Component                                 */
/* -------------------------------------------------------------------------- */

/**
 * Represents the properties available for a `filter` component.
 */
export type NubeComponentFilterProps = Prettify<
	NubeComponentBase &
		ChildrenProps &
		Partial<{
			id: string;
			x: number | string;
			y: number | string;
			width: number | string;
			height: number | string;
			filterUnits: "userSpaceOnUse" | "objectBoundingBox";
			primitiveUnits: "userSpaceOnUse" | "objectBoundingBox";
			style?: NubeComponentStyle;
		}>
>;

/**
 * Represents a `filter` component, used for applying filters to SVG elements.
 */
export type NubeComponentFilter = Prettify<
	NubeComponentBase &
		NubeComponentFilterProps & {
			type: "svgFilter";
		}
>;

/* -------------------------------------------------------------------------- */
/*                           FeGaussianBlur Component                         */
/* -------------------------------------------------------------------------- */

/**
 * Represents the properties available for a `feGaussianBlur` component.
 */
export type NubeComponentFeGaussianBlurProps = Prettify<
	NubeComponentBase &
		Partial<{
			stdDeviation: number | string;
			edgeMode: "duplicate" | "wrap" | "none";
			style?: NubeComponentStyle;
		}>
>;

/**
 * Represents a `feGaussianBlur` component, used for blur effects.
 */
export type NubeComponentFeGaussianBlur = Prettify<
	NubeComponentBase &
		NubeComponentFeGaussianBlurProps & {
			type: "svgFeGaussianBlur";
		}
>;

/* -------------------------------------------------------------------------- */
/*                           FeOffset Component                               */
/* -------------------------------------------------------------------------- */

/**
 * Represents the properties available for a `feOffset` component.
 */
export type NubeComponentFeOffsetProps = Prettify<
	NubeComponentBase &
		Partial<{
			dx: number | string;
			dy: number | string;
			in: string;
			style?: NubeComponentStyle;
		}>
>;

/**
 * Represents a `feOffset` component, used for offset effects.
 */
export type NubeComponentFeOffset = Prettify<
	NubeComponentBase &
		NubeComponentFeOffsetProps & {
			type: "svgFeOffset";
		}
>;

/* -------------------------------------------------------------------------- */
/*                           FeMerge Component                                */
/* -------------------------------------------------------------------------- */

/**
 * Represents the properties available for a `feMerge` component.
 */
export type NubeComponentFeMergeProps = Prettify<
	NubeComponentBase & ChildrenProps
>;

/**
 * Represents a `feMerge` component, used for merging filter effects.
 */
export type NubeComponentFeMerge = Prettify<
	NubeComponentBase &
		NubeComponentFeMergeProps & {
			type: "svgFeMerge";
		}
>;

/* -------------------------------------------------------------------------- */
/*                           FeMergeNode Component                            */
/* -------------------------------------------------------------------------- */

/**
 * Represents the properties available for a `feMergeNode` component.
 */
export type NubeComponentFeMergeNodeProps = Prettify<
	NubeComponentBase &
		Partial<{
			in: string;
			style?: NubeComponentStyle;
		}>
>;

/**
 * Represents a `feMergeNode` component, used within feMerge.
 */
export type NubeComponentFeMergeNode = Prettify<
	NubeComponentBase &
		NubeComponentFeMergeNodeProps & {
			type: "svgFeMergeNode";
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
	key?: string | number;
	// DON'T USE THIS, USED INTERNALLY BY THE SDK, ANY VALUE PASSED HERE WILL BE OVERWRITTEN
	__internalId?: NubeComponentId;
};

/**
 * Defines the base structure for all UI components.
 */
export type NubeComponentBase = {
	styled?: string;
} & NubeComponentProps;

/**
 * Defines components that can have child elements.
 */
export type ChildrenProps = {
	children?: NubeComponentChildren;
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
	| NubeComponentNumberField
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
	| NubeComponentIcon
	| NubeComponentSvg
	| NubeComponentCircle
	| NubeComponentPath
	| NubeComponentG
	| NubeComponentRect
	| NubeComponentLine
	| NubeComponentEllipse
	| NubeComponentPolygon
	| NubeComponentPolyline
	| NubeComponentSvgText
	| NubeComponentTSpan
	| NubeComponentDefs
	| NubeComponentStop
	| NubeComponentLinearGradient
	| NubeComponentRadialGradient
	| NubeComponentMask
	| NubeComponentClipPath
	| NubeComponentUse
	| NubeComponentSymbol
	| NubeComponentPattern
	| NubeComponentFilter
	| NubeComponentFeGaussianBlur
	| NubeComponentFeOffset
	| NubeComponentFeMerge
	| NubeComponentFeMergeNode;

/**
 * Represents the children of a UI component.
 */
export type NubeComponentChildren =
	| string
	| NubeComponent
	| (string | NubeComponent)[];

/**
 * Represents components that can contain other components as children.
 */
export type NubeComponentWithChildren =
	| NubeComponentBox
	| NubeComponentColumn
	| NubeComponentRow
	| NubeComponentSvg
	| NubeComponentG
	| NubeComponentDefs
	| NubeComponentLinearGradient
	| NubeComponentRadialGradient
	| NubeComponentMask
	| NubeComponentClipPath
	| NubeComponentSymbol
	| NubeComponentPattern
	| NubeComponentFilter
	| NubeComponentFeMerge;

/**
 * Represents the value of a UI component, typically used for form inputs.
 */
export type UIValue = string;

/**
 * Represents a mapping of UI slots to their respective components.
 */
export type UISlots = Partial<
	Record<
		UISlot,
		NubeComponent | NubeComponent[] | Record<string, NubeComponent>
	>
>;

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

/**
 * Type for components that have been styled with the styled function.
 * Extends NubeComponent with the styled property containing CSS.
 */
export type NubeComponentWithStyle = NubeComponent & { styled: string };
