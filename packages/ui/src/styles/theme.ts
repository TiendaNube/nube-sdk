import { ThemeColor } from "./ThemeColor";

export const theme = {
	color: {
		accent: new ThemeColor("accent-color"),
		main: {
			foreground: new ThemeColor("main-foreground"),
			background: new ThemeColor("main-background"),
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
		borderColor: "var(--button-border-color)",
		borderRadius: "var(--button-border-radius)",
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
export type ThemeColorValue = ReturnType<ThemeColor["toValue"]>;
export type ThemeColorOpacityValue = ReturnType<ThemeColor["opacity"]>;

type ThemeCSSPrimitive = string | number;

export type ThemeCSSValue =
	| ThemeColor
	| ThemeColorOpacityValue
	| ThemeCSSPrimitive;
