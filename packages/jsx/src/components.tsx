import type {
	NubeComponentAccordionContent,
	NubeComponentAccordionContentProps,
	NubeComponentAccordionHeader,
	NubeComponentAccordionHeaderProps,
	NubeComponentAccordionItem,
	NubeComponentAccordionItemProps,
	NubeComponentAccordionRoot,
	NubeComponentAccordionRootProps,
	NubeComponentBox,
	NubeComponentBoxProps,
	NubeComponentButton,
	NubeComponentButtonProps,
	NubeComponentCheckbox,
	NubeComponentCheckboxProps,
	NubeComponentCircle,
	NubeComponentCircleProps,
	NubeComponentClipPath,
	NubeComponentClipPathProps,
	NubeComponentColumn,
	NubeComponentColumnProps,
	NubeComponentDefs,
	NubeComponentDefsProps,
	NubeComponentEllipse,
	NubeComponentEllipseProps,
	NubeComponentFeGaussianBlur,
	NubeComponentFeGaussianBlurProps,
	NubeComponentFeMerge,
	NubeComponentFeMergeNode,
	NubeComponentFeMergeNodeProps,
	NubeComponentFeMergeProps,
	NubeComponentFeOffset,
	NubeComponentFeOffsetProps,
	NubeComponentField,
	NubeComponentFieldProps,
	NubeComponentFilter,
	NubeComponentFilterProps,
	NubeComponentFragment,
	NubeComponentFragmentProps,
	NubeComponentG,
	NubeComponentGProps,
	NubeComponentIcon,
	NubeComponentIconProps,
	NubeComponentImage,
	NubeComponentImageProps,
	NubeComponentLine,
	NubeComponentLineProps,
	NubeComponentLinearGradient,
	NubeComponentLinearGradientProps,
	NubeComponentLink,
	NubeComponentLinkProps,
	NubeComponentMask,
	NubeComponentMaskProps,
	NubeComponentNumberField,
	NubeComponentNumberFieldProps,
	NubeComponentPath,
	NubeComponentPathProps,
	NubeComponentPattern,
	NubeComponentPatternProps,
	NubeComponentPolygon,
	NubeComponentPolygonProps,
	NubeComponentPolyline,
	NubeComponentPolylineProps,
	NubeComponentProgress,
	NubeComponentProgressProps,
	NubeComponentRadialGradient,
	NubeComponentRadialGradientProps,
	NubeComponentRect,
	NubeComponentRectProps,
	NubeComponentRow,
	NubeComponentRowProps,
	NubeComponentSelect,
	NubeComponentSelectProps,
	NubeComponentStop,
	NubeComponentStopProps,
	NubeComponentSvg,
	NubeComponentSvgProps,
	NubeComponentSvgText,
	NubeComponentSvgTextProps,
	NubeComponentSymbol,
	NubeComponentSymbolProps,
	NubeComponentTSpan,
	NubeComponentTSpanProps,
	NubeComponentText,
	NubeComponentTextProps,
	NubeComponentTextarea,
	NubeComponentTextareaProps,
	NubeComponentToastDescription,
	NubeComponentToastDescriptionProps,
	NubeComponentToastRoot,
	NubeComponentToastRootProps,
	NubeComponentToastTitle,
	NubeComponentToastTitleProps,
	NubeComponentUse,
	NubeComponentUseProps,
} from "@tiendanube/nube-sdk-types";
import {
	accordionContent,
	accordionHeader,
	accordionItem,
	accordionRoot,
	box,
	button,
	checkbox,
	column,
	field,
	fragment,
	icon,
	image,
	link,
	numberfield,
	progress,
	row,
	select,
	svgCircle,
	svgClipPath,
	svgDefs,
	svgEllipse,
	svgFeGaussianBlur,
	svgFeMerge,
	svgFeMergeNode,
	svgFeOffset,
	svgFilter,
	svgG,
	svgLine,
	svgLinearGradient,
	svgMask,
	svgPath,
	svgPattern,
	svgPolygon,
	svgPolyline,
	svgRadialGradient,
	svgRect,
	svgRoot,
	svgStop,
	svgSymbol,
	svgText,
	svgTspan,
	svgUse,
	text,
	textarea,
	toastDescription,
	toastRoot,
	toastTitle,
} from "@tiendanube/nube-sdk-ui";

/**
 * Creates a `Box` component.
 *
 * The `Box` component is a flexible container used for structuring layouts.
 * It supports properties like width, height, padding, margin, and flex-based alignment.
 *
 * @param props - The properties for configuring the box component.
 * @returns A `NubeComponentBox` object representing the box component.
 */
export function Box(props: NubeComponentBoxProps): NubeComponentBox {
	return box(props);
}

/**
 * @deprecated This component has been deprecated since version `0.8.0`. Please use the `Column` component instead.
 */
export function Col(props: NubeComponentColumnProps): NubeComponentColumn {
	return column(props);
}

/**
 * Creates a `Col` (column) component.
 *
 * The `Col` component is a flexible column container used for structuring layouts.
 * It inherits most properties from `Box`, except for the `direction` property.
 *
 * @param props - The properties for configuring the column component.
 * @returns A `NubeComponentColumn` object representing the column component.
 */
export function Column(props: NubeComponentColumnProps): NubeComponentColumn {
	return column(props);
}

/**
 * Creates a `Row` component.
 *
 * The `Row` component is a flexible row container used for structuring layouts in a horizontal direction.
 * It inherits most properties from `Box`, except for the `direction` property.
 *
 * @param props - The properties for configuring the row component.
 * @returns A `NubeComponentRow` object representing the row component.
 */
export function Row(props: NubeComponentRowProps): NubeComponentRow {
	return row(props);
}

/**
 * Creates a `Field` component.
 *
 * The `Field` component represents an input element in a form, such as text fields, dropdowns, or checkboxes.
 * It supports properties like `name`, `label`, and event handlers (`onChange`, `onBlur`, `onFocus`).
 *
 * @param props - The properties for configuring the field component.
 * @returns A `NubeComponentField` object representing the form field.
 */
export function Field(props: NubeComponentFieldProps): NubeComponentField {
	return field(props);
}

/**
 * Creates a `NumberField` component.
 *
 * The `NumberField` component represents a numeric input element with increment/decrement buttons.
 * It supports properties like `name`, `label`, `min`, `max`, `step`, and event handlers.
 *
 * @param props - The properties for configuring the numberfield component.
 * @returns A `NubeComponentNumberField` object representing the numeric form field.
 */
export function NumberField(
	props: NubeComponentNumberFieldProps,
): NubeComponentNumberField {
	return numberfield(props);
}

/**
 * Creates a `Button` component.
 *
 * The `Button` component represents a clickable element typically used to trigger an action or submit a form.
 * It supports properties like `text` and event handlers (e.g., `onClick`).
 *
 * @param props - The properties for configuring the button component.
 * @returns A `NubeComponentButton` object representing the button component.
 */
export function Button(props: NubeComponentButtonProps): NubeComponentButton {
	return button(props);
}

/**
 * Creates a `Link` component.
 *
 * The `Link` component is used for navigation links. It supports properties such as
 * `href`, `target`, `rel`, `disabled`, `variant`, and `onClick` event handling.
 * Links can be styled with different variants (primary, secondary, transparent)
 * and support both internal and external navigation.
 *
 * @param props - The properties for configuring the link component.
 * @returns A `NubeComponentLink` object representing the link component.
 */
export function Link(props: NubeComponentLinkProps): NubeComponentLink {
	return link(props);
}

/**
 * Creates a `Fragment` component.
 *
 * The `Fragment` component is a logical grouping element that allows multiple children
 * to be wrapped without introducing an additional DOM node.
 *
 * @param props - The properties for configuring the fragment component.
 * @returns A `NubeComponentFragment` object representing the fragment.
 */
export function Fragment(
	props: NubeComponentFragmentProps,
): NubeComponentFragment {
	return fragment(props);
}

/**
 * @deprecated This component has been deprecated since version `0.8.0`. Please use the `Text` component instead.
 */
export function Txt(props: NubeComponentTextProps): NubeComponentText {
	return text(props);
}

/**
 * Creates a `Text` (text) component.
 *
 * The `Text` component is used to render text with optional styling.
 * It supports properties such as `color`, `background`, `heading` levels (h1-h6),
 * text formatting `modifiers` (bold, italic, etc.), and inline display.
 *
 * @param props - The properties for configuring the text component.
 * @returns A `NubeComponentText` object representing the text component.
 */
export function Text(props: NubeComponentTextProps): NubeComponentText {
	return text(props);
}

/**
 * @deprecated This component has been deprecated since version `0.8.0`. Please use the `Checkbox` component instead.
 */
export function Check(
	props: NubeComponentCheckboxProps,
): NubeComponentCheckbox {
	return checkbox(props);
}

/**
 * Creates a `Checkbox` component.
 *
 * A `Check` represents a selectable field that can be toggled between checked and unchecked states.
 * It is typically used to allow users to select one or more options.
 * It supports properties such as `name`, `label`, `checked`, and event handlers (`onChange`).
 *
 * @param props - The properties for configuring the check component.
 * @returns A `NubeComponentCheckbox` object representing the check component.
 */
export function Checkbox(
	props: NubeComponentCheckboxProps,
): NubeComponentCheckbox {
	return checkbox(props);
}

/**
 * @deprecated This component has been deprecated since version `0.8.0`. Please use the `Textarea` component instead.
 */
export function Txtarea(
	props: NubeComponentTextareaProps,
): NubeComponentTextarea {
	return textarea(props);
}

/**
 * Creates a `Textarea` component.
 *
 * A `Textarea` represents a multi-line text input field that allows users to enter longer texts.
 * It supports properties such as `name`, `value`, and event handlers (`onChange`, `onBlur`, `onFocus`).
 *
 * @param props - The properties for configuring the textarea component.
 * @returns A `NubeComponentTextarea` object representing the textarea component.
 */
export function Textarea(
	props: NubeComponentTextareaProps,
): NubeComponentTextarea {
	return textarea(props);
}

/**
 * @deprecated This component has been deprecated since version `0.8.0`. Please use the `Image` component instead.
 */
export function Img(props: NubeComponentImageProps): NubeComponentImage {
	return image(props);
}

/**
 * Creates an `Img` (image) component.
 *
 * The `Img` component is used to display images. It supports properties such as
 * `src`, `alt`, `width`, `height`, and responsive `sources` for different screen sizes.
 *
 * @param props - The properties for configuring the image component.
 * @returns A `NubeComponentImg` object representing the image component.
 */
export function Image(props: NubeComponentImageProps): NubeComponentImage {
	return image(props);
}

/**
 * Creates a `Progress` component.
 *
 * A `Progress` represents the completion progress of a task. It supports properties such as `value` and `max`
 * to define the progress range and current state. When no value is provided, the progress bar
 * displays in an indeterminate state.
 *
 * @param props - The properties for configuring the progress component.
 * @returns A `NubeComponentProgress` object representing the progress component.
 */
export function Progress(
	props: NubeComponentProgressProps,
): NubeComponentProgress {
	return progress(props);
}

/**
 * Creates a `Select` component.
 *
 * A `Select` represents a dropdown menu that allows users to select one option from a list.
 * It supports properties such as `name`, `label`, `options`, and event handlers (`onChange`).
 *
 * @param props - The properties for configuring the select component.
 * @returns A `NubeComponentSelect` object representing the select component.
 */
export function Select(props: NubeComponentSelectProps): NubeComponentSelect {
	return select(props);
}

/**
 * Creates an `Accordion` component.
 *
 * The `Accordion` component is a vertically stacked list of items that can be expanded or collapsed to reveal their content.
 * It supports properties such as `title`, `content`, and child `AccordionItem` components.
 *
 * @param props - The properties for configuring the accordion component.
 * @returns A `NubeComponentAccordion` object representing the accordion component.
 */
function AccordionRoot(
	props: NubeComponentAccordionRootProps,
): NubeComponentAccordionRoot {
	return accordionRoot(props);
}

/**
 * Creates an `AccordionItem` component.
 *
 * The `AccordionItem` component represents a single item within an accordion.
 * Each item contains a header that can be clicked to show/hide its content.
 * It supports properties such as `title` and child content.
 *
 * @param props - The properties for configuring the accordion item component.
 * @returns A `NubeComponentAccordionItem` object representing the accordion item component.
 */
function AccordionItem(
	props: NubeComponentAccordionItemProps,
): NubeComponentAccordionItem {
	return accordionItem(props);
}

/**
 * Creates an `AccordionContent` component.
 *
 * The `AccordionContent` component represents the content of an accordion item.
 * It supports properties such as `children`.
 *
 * @param props - The properties for configuring the accordion content component.
 * @returns A `NubeComponentAccordionContent` object representing the accordion content component.
 */
function AccordionContent(
	props: NubeComponentAccordionContentProps,
): NubeComponentAccordionContent {
	return accordionContent(props);
}

function AccordionHeader(
	props: NubeComponentAccordionHeaderProps,
): NubeComponentAccordionHeader {
	return accordionHeader(props);
}

export const Accordion = {
	Root: AccordionRoot,
	Item: AccordionItem,
	Content: AccordionContent,
	Header: AccordionHeader,
};

/**
 * Creates a `Toast` component.
 *
 * A `Toast` is a small notification that appears at the bottom of the screen to inform the user about an action or a message.
 * It supports properties such as `type` for controlling the type of toast, and custom styling.
 */
function ToastRoot(props: NubeComponentToastRootProps): NubeComponentToastRoot {
	return toastRoot(props);
}

function ToastTitle(
	props: NubeComponentToastTitleProps,
): NubeComponentToastTitle {
	return toastTitle(props);
}

function ToastDescription(
	props: NubeComponentToastDescriptionProps,
): NubeComponentToastDescription {
	return toastDescription(props);
}

export const Toast = {
	Root: ToastRoot,
	Title: ToastTitle,
	Description: ToastDescription,
};

/**
 * Creates an `Icon` component.
 *
 * The `Icon` component is used to display icons. It supports properties such as `name` for specifying the icon to display.
 *
 * @param props - The properties for configuring the icon component.
 * @returns A `NubeComponentIcon` object representing the icon component.
 */
export function Icon(props: NubeComponentIconProps): NubeComponentIcon {
	return icon(props);
}

/**
 * Creates an `Svg` component.
 *
 * The `Svg` component is the root container for SVG graphics.
 * It supports properties such as `width`, `height`, `viewBox`, and `preserveAspectRatio`.
 *
 * @param props - The properties for configuring the svg component.
 * @returns A `NubeComponentSvg` object representing the svg component.
 */
function SvgRoot(props: NubeComponentSvgProps): NubeComponentSvg {
	return svgRoot(props);
}

/**
 * Creates a `Circle` component.
 *
 * The `Circle` component is used for drawing circles in SVG.
 * It supports properties such as `cx`, `cy`, `r`, `fill`, `stroke`, and `strokeWidth`.
 *
 * @param props - The properties for configuring the circle component.
 * @returns A `NubeComponentCircle` object representing the circle component.
 */
function SvgCircle(props: NubeComponentCircleProps): NubeComponentCircle {
	return svgCircle(props);
}

/**
 * Creates a `Path` component.
 *
 * The `Path` component is used for drawing custom paths in SVG.
 * It supports properties such as `d`, `fill`, `stroke`, and `strokeWidth`.
 *
 * @param props - The properties for configuring the path component.
 * @returns A `NubeComponentPath` object representing the path component.
 */
function SvgPath(props: NubeComponentPathProps): NubeComponentPath {
	return svgPath(props);
}

/**
 * Creates a `G` component.
 *
 * The `G` component is used for grouping SVG elements.
 * It supports properties such as `transform` and `opacity`.
 *
 * @param props - The properties for configuring the g component.
 * @returns A `NubeComponentG` object representing the g component.
 */
function SvgG(props: NubeComponentGProps): NubeComponentG {
	return svgG(props);
}

/**
 * Creates a `Rect` component.
 *
 * The `Rect` component is used for drawing rectangles in SVG.
 * It supports properties such as `x`, `y`, `width`, `height`, `fill`, and `stroke`.
 *
 * @param props - The properties for configuring the rect component.
 * @returns A `NubeComponentRect` object representing the rect component.
 */
function SvgRect(props: NubeComponentRectProps): NubeComponentRect {
	return svgRect(props);
}

/**
 * Creates a `Line` component.
 *
 * The `Line` component is used for drawing lines in SVG.
 * It supports properties such as `x1`, `y1`, `x2`, `y2`, `stroke`, and `strokeWidth`.
 *
 * @param props - The properties for configuring the line component.
 * @returns A `NubeComponentLine` object representing the line component.
 */
function SvgLine(props: NubeComponentLineProps): NubeComponentLine {
	return svgLine(props);
}

/**
 * Creates an `Ellipse` component.
 *
 * The `Ellipse` component is used for drawing ellipses in SVG.
 * It supports properties such as `cx`, `cy`, `rx`, `ry`, `fill`, and `stroke`.
 *
 * @param props - The properties for configuring the ellipse component.
 * @returns A `NubeComponentEllipse` object representing the ellipse component.
 */
function SvgEllipse(props: NubeComponentEllipseProps): NubeComponentEllipse {
	return svgEllipse(props);
}

/**
 * Creates a `Polygon` component.
 *
 * The `Polygon` component is used for drawing polygons in SVG.
 * It supports properties such as `points`, `fill`, and `stroke`.
 *
 * @param props - The properties for configuring the polygon component.
 * @returns A `NubeComponentPolygon` object representing the polygon component.
 */
function SvgPolygon(props: NubeComponentPolygonProps): NubeComponentPolygon {
	return svgPolygon(props);
}

/**
 * Creates a `Polyline` component.
 *
 * The `Polyline` component is used for drawing polylines in SVG.
 * It supports properties such as `points`, `fill`, and `stroke`.
 *
 * @param props - The properties for configuring the polyline component.
 * @returns A `NubeComponentPolyline` object representing the polyline component.
 */
function SvgPolyline(props: NubeComponentPolylineProps): NubeComponentPolyline {
	return svgPolyline(props);
}

/**
 * Creates an `SvgText` component.
 *
 * The `SvgText` component is used for displaying text in SVG.
 * It supports properties such as `x`, `y`, `fontSize`, `fill`, and `textAnchor`.
 *
 * @param props - The properties for configuring the svg text component.
 * @returns A `NubeComponentSvgText` object representing the svg text component.
 */
function SvgText(props: NubeComponentSvgTextProps): NubeComponentSvgText {
	return svgText(props);
}

/**
 * Creates a `TSpan` component.
 *
 * The `TSpan` component is used for text spans within SVG text elements.
 * It supports properties such as `x`, `y`, `fontSize`, and `fill`.
 *
 * @param props - The properties for configuring the tspan component.
 * @returns A `NubeComponentTSpan` object representing the tspan component.
 */
function SvgTSpan(props: NubeComponentTSpanProps): NubeComponentTSpan {
	return svgTspan(props);
}

/**
 * Creates a `Defs` component.
 *
 * The `Defs` component is used for defining reusable SVG elements.
 * It supports child elements that can be referenced later.
 *
 * @param props - The properties for configuring the defs component.
 * @returns A `NubeComponentDefs` object representing the defs component.
 */
function SvgDefs(props: NubeComponentDefsProps): NubeComponentDefs {
	return svgDefs(props);
}

/**
 * Creates a `Stop` component.
 *
 * The `Stop` component is used within gradient definitions to specify color stops.
 * It supports properties such as `offset`, `stopColor`, and `stopOpacity`.
 *
 * @param props - The properties for configuring the stop component.
 * @returns A `NubeComponentStop` object representing the stop component.
 */
function SvgStop(props: NubeComponentStopProps): NubeComponentStop {
	return svgStop(props);
}

/**
 * Creates a `LinearGradient` component.
 *
 * The `LinearGradient` component is used for defining linear gradients in SVG.
 * It supports properties such as `id`, `x1`, `y1`, `x2`, `y2`, and `gradientUnits`.
 *
 * @param props - The properties for configuring the linear gradient component.
 * @returns A `NubeComponentLinearGradient` object representing the linear gradient component.
 */
function SvgLinearGradient(
	props: NubeComponentLinearGradientProps,
): NubeComponentLinearGradient {
	return svgLinearGradient(props);
}

/**
 * Creates a `RadialGradient` component.
 *
 * The `RadialGradient` component is used for defining radial gradients in SVG.
 * It supports properties such as `id`, `cx`, `cy`, `r`, and `gradientUnits`.
 *
 * @param props - The properties for configuring the radial gradient component.
 * @returns A `NubeComponentRadialGradient` object representing the radial gradient component.
 */
function SvgRadialGradient(
	props: NubeComponentRadialGradientProps,
): NubeComponentRadialGradient {
	return svgRadialGradient(props);
}

/**
 * Creates a `Mask` component.
 *
 * The `Mask` component is used for defining masks in SVG.
 * It supports properties such as `id`, `x`, `y`, `width`, `height`, and `maskUnits`.
 *
 * @param props - The properties for configuring the mask component.
 * @returns A `NubeComponentMask` object representing the mask component.
 */
function SvgMask(props: NubeComponentMaskProps): NubeComponentMask {
	return svgMask(props);
}

/**
 * Creates a `ClipPath` component.
 *
 * The `ClipPath` component is used for defining clipping paths in SVG.
 * It supports properties such as `id` and `clipPathUnits`.
 *
 * @param props - The properties for configuring the clip path component.
 * @returns A `NubeComponentClipPath` object representing the clip path component.
 */
function SvgClipPath(props: NubeComponentClipPathProps): NubeComponentClipPath {
	return svgClipPath(props);
}

/**
 * Creates a `Use` component.
 *
 * The `Use` component is used for referencing and reusing SVG elements.
 * It supports properties such as `href`, `x`, `y`, `width`, and `height`.
 *
 * @param props - The properties for configuring the use component.
 * @returns A `NubeComponentUse` object representing the use component.
 */
function SvgUse(props: NubeComponentUseProps): NubeComponentUse {
	return svgUse(props);
}

/**
 * Creates a `Symbol` component.
 *
 * The `Symbol` component is used for defining reusable SVG symbols.
 * It supports properties such as `id`, `viewBox`, and `preserveAspectRatio`.
 *
 * @param props - The properties for configuring the symbol component.
 * @returns A `NubeComponentSymbol` object representing the symbol component.
 */
function SvgSymbol(props: NubeComponentSymbolProps): NubeComponentSymbol {
	return svgSymbol(props);
}

/**
 * Creates a `Pattern` component.
 *
 * The `Pattern` component is used for defining patterns in SVG.
 * It supports properties such as `id`, `x`, `y`, `width`, `height`, and `patternUnits`.
 *
 * @param props - The properties for configuring the pattern component.
 * @returns A `NubeComponentPattern` object representing the pattern component.
 */
function SvgPattern(props: NubeComponentPatternProps): NubeComponentPattern {
	return svgPattern(props);
}

/**
 * Creates a `Filter` component.
 *
 * The `Filter` component is used for defining filters in SVG.
 * It supports properties such as `id`, `x`, `y`, `width`, `height`, and `filterUnits`.
 *
 * @param props - The properties for configuring the filter component.
 * @returns A `NubeComponentFilter` object representing the filter component.
 */
function SvgFilter(props: NubeComponentFilterProps): NubeComponentFilter {
	return svgFilter(props);
}

/**
 * Creates a `FeGaussianBlur` component.
 *
 * The `FeGaussianBlur` component is used for applying Gaussian blur effects in SVG filters.
 * It supports properties such as `stdDeviation` and `edgeMode`.
 *
 * @param props - The properties for configuring the feGaussianBlur component.
 * @returns A `NubeComponentFeGaussianBlur` object representing the feGaussianBlur component.
 */
function SvgFeGaussianBlur(
	props: NubeComponentFeGaussianBlurProps,
): NubeComponentFeGaussianBlur {
	return svgFeGaussianBlur(props);
}

/**
 * Creates a `FeOffset` component.
 *
 * The `FeOffset` component is used for applying offset effects in SVG filters.
 * It supports properties such as `dx`, `dy`, and `in`.
 *
 * @param props - The properties for configuring the feOffset component.
 * @returns A `NubeComponentFeOffset` object representing the feOffset component.
 */
function SvgFeOffset(props: NubeComponentFeOffsetProps): NubeComponentFeOffset {
	return svgFeOffset(props);
}

/**
 * Creates a `FeMerge` component.
 *
 * The `FeMerge` component is used for merging multiple filter effects in SVG.
 * It supports child `FeMergeNode` elements.
 *
 * @param props - The properties for configuring the feMerge component.
 * @returns A `NubeComponentFeMerge` object representing the feMerge component.
 */
function SvgFeMerge(props: NubeComponentFeMergeProps): NubeComponentFeMerge {
	return svgFeMerge(props);
}

/**
 * Creates a `FeMergeNode` component.
 *
 * The `FeMergeNode` component is used within `FeMerge` elements to specify input sources.
 * It supports properties such as `in`.
 *
 * @param props - The properties for configuring the feMergeNode component.
 * @returns A `NubeComponentFeMergeNode` object representing the feMergeNode component.
 */
function SvgFeMergeNode(
	props: NubeComponentFeMergeNodeProps,
): NubeComponentFeMergeNode {
	return svgFeMergeNode(props);
}

export const Svg = {
	Root: SvgRoot,
	Circle: SvgCircle,
	Path: SvgPath,
	G: SvgG,
	Rect: SvgRect,
	Line: SvgLine,
	Ellipse: SvgEllipse,
	Polygon: SvgPolygon,
	Polyline: SvgPolyline,
	Text: SvgText,
	TSpan: SvgTSpan,
	Defs: SvgDefs,
	Stop: SvgStop,
	LinearGradient: SvgLinearGradient,
	RadialGradient: SvgRadialGradient,
	Mask: SvgMask,
	ClipPath: SvgClipPath,
	Use: SvgUse,
	Symbol: SvgSymbol,
	Pattern: SvgPattern,
	Filter: SvgFilter,
	FeGaussianBlur: SvgFeGaussianBlur,
	FeOffset: SvgFeOffset,
	FeMerge: SvgFeMerge,
	FeMergeNode: SvgFeMergeNode,
};
