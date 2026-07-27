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
			light: "var(--success-light)",
			medium: "var(--success)",
			dark: "var(--success-dark)",
		},
		warning: {
			light: "var(--warning-light)",
			medium: "var(--warning)",
			dark: "var(--warning-dark)",
		},
		danger: {
			light: "var(--danger-light)",
			medium: "var(--danger)",
			dark: "var(--danger-dark)",
		},
		info: {
			light: "var(--info-light)",
			medium: "var(--info)",
			dark: "var(--info-dark)",
		},
		neutral: {
			light: "var(--neutral-light)",
			medium: "var(--neutral)",
			dark: "var(--neutral-dark)",
		},
		text: {
			high: "var(--text-foreground-high)",
			medium: "var(--text-foreground-medium)",
			low: "var(--text-foreground-low)",
		},
	},
	typography: {
		body: {
			font: "var(--body-font)",
			fontSize: "var(--body-font-size)",
			lineHeight: "var(--body-font-leading)",
		},
		xl: {
			fontSize: "var(--font-xl)",
			lineHeight: "var(--font-xl-leading)",
		},
		lg: {
			fontSize: "var(--font-lg)",
			lineHeight: "var(--font-lg-leading)",
		},
		base: {
			fontSize: "var(--font-base)",
			lineHeight: "var(--font-base-leading)",
		},
		md: {
			fontSize: "var(--font-md)",
			lineHeight: "var(--font-md-leading)",
		},
		sm: {
			fontSize: "var(--font-sm)",
			lineHeight: "var(--font-sm-leading)",
		},
		xs: {
			fontSize: "var(--font-xs)",
			lineHeight: "var(--font-xs-leading)",
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
