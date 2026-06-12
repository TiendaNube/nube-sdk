/**
 * Global type declarations for NubeSDK snippets.
 *
 * Snippets are code fragments that are injected into apps managed by the platform.
 * Unlike full apps, snippets use global objects without explicit imports.
 *
 * This file declares all global variables available in the snippet context.
 *
 * Usage in snippets:
 * @example
 * /// <reference types="@tiendanube/nube-sdk-snippet" />
 */

declare global {
	// ============================================================================
	// SDK Types (from @tiendanube/nube-sdk-types)
	// Re-exported as globals so snippets can use them without explicit imports.
	// ============================================================================

	/** Main SDK instance type */
	type NubeSDK = import("@tiendanube/nube-sdk-types").NubeSDK;
	/** Full state object passed to render callbacks */
	type NubeSDKState = import("@tiendanube/nube-sdk-types").NubeSDKState;
	/** Supported language codes */
	type LanguageKey = import("@tiendanube/nube-sdk-types").LanguageKey;
	/** Generic NubeSDK component type */
	type NubeComponent = import("@tiendanube/nube-sdk-types").NubeComponent;
	/** UI slot identifier */
	type UISlot = import("@tiendanube/nube-sdk-types").UISlot;
	/** Storefront UI slot identifier */
	type StorefrontUISlot = import("@tiendanube/nube-sdk-types").StorefrontUISlot;
	/** Checkout UI slot identifier */
	type CheckoutUISlot = import("@tiendanube/nube-sdk-types").CheckoutUISlot;
	/** App settings values */
	type AppSettingsValues =
		import("@tiendanube/nube-sdk-types").AppSettingsValues;
	/** State modifier function type */
	type NubeSDKStateModifier =
		import("@tiendanube/nube-sdk-types").NubeSDKStateModifier;

	/** The NubeSDK instance - main entry point for interacting with the platform */
	const nube: import("@tiendanube/nube-sdk-types").NubeSDK;

	// ============================================================================
	// JSX Components (from @tiendanube/nube-sdk-jsx)
	// ============================================================================

	/** Box component - flexible container for layouts */
	const Box: typeof import("@tiendanube/nube-sdk-jsx").Box;
	/** Column component - vertical layout container */
	const Column: typeof import("@tiendanube/nube-sdk-jsx").Column;
	/** Row component - horizontal layout container */
	const Row: typeof import("@tiendanube/nube-sdk-jsx").Row;
	/** Text component - renders text with optional styling */
	const Text: typeof import("@tiendanube/nube-sdk-jsx").Text;
	/** Button component - clickable element for actions */
	const Button: typeof import("@tiendanube/nube-sdk-jsx").Button;
	/** Link component - navigation links */
	const Link: typeof import("@tiendanube/nube-sdk-jsx").Link;
	/** Image component - displays images */
	const Image: typeof import("@tiendanube/nube-sdk-jsx").Image;
	/** Icon component - displays icons */
	const Icon: typeof import("@tiendanube/nube-sdk-jsx").Icon;
	/** Field component - form input element */
	const Field: typeof import("@tiendanube/nube-sdk-jsx").Field;
	/** NumberField component - numeric input with increment/decrement */
	const NumberField: typeof import("@tiendanube/nube-sdk-jsx").NumberField;
	/** Select component - dropdown menu */
	const Select: typeof import("@tiendanube/nube-sdk-jsx").Select;
	/** Checkbox component - selectable toggle */
	const Checkbox: typeof import("@tiendanube/nube-sdk-jsx").Checkbox;
	/** Textarea component - multi-line text input */
	const Textarea: typeof import("@tiendanube/nube-sdk-jsx").Textarea;
	/** Fragment component - logical grouping without DOM node */
	const Fragment: typeof import("@tiendanube/nube-sdk-jsx").Fragment;
	/** Progress component - displays task completion progress */
	const Progress: typeof import("@tiendanube/nube-sdk-jsx").Progress;
	/** Iframe component - embeds external content */
	const Iframe: typeof import("@tiendanube/nube-sdk-jsx").Iframe;
	/** Markdown component - renders markdown content */
	const Markdown: typeof import("@tiendanube/nube-sdk-jsx").Markdown;
	/** SideScroll component - horizontal scrolling container */
	const SideScroll: typeof import("@tiendanube/nube-sdk-jsx").SideScroll;
	/** Accordion component - expandable/collapsible list */
	const Accordion: typeof import("@tiendanube/nube-sdk-jsx").Accordion;
	/** Toast component - notification messages */
	const Toast: typeof import("@tiendanube/nube-sdk-jsx").Toast;
	/** Svg component - SVG graphics container and elements */
	const Svg: typeof import("@tiendanube/nube-sdk-jsx").Svg;

	// ============================================================================
	// UI Utilities (from @tiendanube/nube-sdk-ui)
	// ============================================================================

	/** styled function - CSS-in-JS for component styling */
	const styled: typeof import("@tiendanube/nube-sdk-ui").styled;
	/** keyframes function - defines CSS animations */
	const keyframes: typeof import("@tiendanube/nube-sdk-ui").keyframes;
	/** theme object - access to theme tokens and variables */
	const theme: typeof import("@tiendanube/nube-sdk-ui").theme;
	/** StyleSheet - creates named style objects */
	const StyleSheet: typeof import("@tiendanube/nube-sdk-ui").StyleSheet;
}

export type {};
