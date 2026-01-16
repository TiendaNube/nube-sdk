import type {
	ThemeCSSValue,
	ThemeColorOpacityValue,
	ThemeColorValue,
} from "@tiendanube/nube-sdk-types";
import { ThemeColor } from "./ThemeColor";

export const theme = {
	color: {
		accent: new ThemeColor("accent-color"),
		main: {
			foreground: new ThemeColor("main-foreground"),
			background: new ThemeColor("main-background"),
		},
		success: {
			light: "var(--_success-light)",
			medium: "var(--_success)",
			dark: "var(--_success-dark)",
		},
		warning: {
			light: "var(--_warning-light)",
			medium: "var(--_warning)",
			dark: "var(--_warning-dark)",
		},
		danger: {
			light: "var(--_danger-light)",
			medium: "var(--_danger)",
			dark: "var(--_danger-dark)",
		},
		info: {
			light: "var(--_info-light)",
			medium: "var(--_info)",
			dark: "var(--_info-dark)",
		},
		neutral: {
			light: "var(--_neutral-light)",
			medium: "var(--_neutral)",
			dark: "var(--_neutral-dark)",
		},
		text: {
			high: "var(--text-foreground-high)",
			medium: "var(--text-foreground-medium)",
			low: "var(--text-foreground-low)",
		},
	},
	typography: {
		body: {
			font: "var(--_body-font)",
			fontSize: "var(--_body-font-size)",
			lineHeight: "var(--_body-font-leading)",
		},
		xl: {
			fontSize: "var(--_font-xl)",
			lineHeight: "var(--_font-xl-leading)",
		},
		lg: {
			fontSize: "var(--_font-lg)",
			lineHeight: "var(--_font-lg-leading)",
		},
		base: {
			fontSize: "var(--_font-base)",
			lineHeight: "var(--_font-base-leading)",
		},
		md: {
			fontSize: "var(--_font-md)",
			lineHeight: "var(--_font-md-leading)",
		},
		sm: {
			fontSize: "var(--_font-sm)",
			lineHeight: "var(--_font-sm-leading)",
		},
		xs: {
			fontSize: "var(--_font-xs)",
			lineHeight: "var(--_font-xs-leading)",
		},
	},
	border: {
		color: "var(--border-color)",
		radius: "var(--border-radius)",
	},
	box: {
		border: {
			color: "var(--box-border-color)",
			radius: "var(--box-border-radius)",
		},
	},
	input: {
		border: {
			color: "var(--input-border-color)",
		},
	},
	button: {
		foreground: "var(--button-foreground)",
		background: "var(--button-background)",
		/**
		 * @deprecated Use button.border.color instead.
		 */
		borderColor: "var(--button-border-color)",
		/**
		 * @deprecated Use button.border.radius instead.
		 */
		borderRadius: "var(--button-border-radius)",
		/**
		 * @deprecated Use button.border.width instead.
		 */
		borderWidth: "var(--button-border-width)",
		border: {
			color: "var(--button-border-color)",
			radius: "var(--button-border-radius)",
			width: "var(--button-border-width)",
		},
	},
	label: {
		foreground: "var(--label-foreground)",
		background: "var(--label-background)",
	},
	header: {
		foreground: "var(--header-foreground)",
		background: "var(--header-background)",
		logo: {
			maxWidth: "var(--header-logo-max-width)",
			maxHeight: "var(--header-logo-max-height)",
			font: "var(--header-logo-font)",
			fontSize: "var(--header-logo-font-size)",
			fontWeight: "var(--header-logo-font-weight)",
			textTransform: "var(--header-logo-text-transform)",
			letterSpacing: "var(--header-logo-letter-spacing)",
		},
	},
	footer: {
		foreground: "var(--footer-foreground)",
		background: "var(--footer-background)",
	},
	heading: {
		font: "var(--heading-font)",
		fontWeight: "var(--heading-font-weight)",
		textTransform: "var(--heading-text-transform)",
		letterSpacing: "var(--heading-letter-spacing)",
	},
} as const;

export type Theme = typeof theme;

// Re-export types from the types package for backward compatibility
export type { ThemeColorValue, ThemeColorOpacityValue, ThemeCSSValue };
