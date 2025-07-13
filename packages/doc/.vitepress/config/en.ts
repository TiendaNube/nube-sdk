import { defineConfig } from "vitepress";

export const en = defineConfig({
	lang: "en",
	description: "The fastest way to create your app on Nuvemshop",

	themeConfig: {
		nav: [
			{ text: "Docs", link: "/docs/motivation" },
			{ text: "Components", link: "/docs/components" },
			{ text: "Examples", link: "/docs/examples" },
		],
		sidebar: [
			{
				text: "Concepts",
				collapsed: false,
				items: [
					{ text: "Motivation", link: "/docs/motivation" },
					{ text: "Secure by Design", link: "/docs/secure-by-design" },
					{ text: "Lightning Fast", link: "/docs/lightning-fast" },
					{
						text: "Built for the Modern Web",
						link: "/docs/built-for-modern-web",
					},
					{ text: "Developer First", link: "/docs/developer-first" },
				],
			},
			{
				text: "Getting Started",
				collapsed: false,
				items: [
					{ text: "Creating a new App", link: "/docs/getting-started" },
					{ text: "DevTools", link: "/docs/devtools" },
					{ text: "App State", link: "/docs/state" },
					{ text: "Events", link: "/docs/events" },
					{ text: "Browser API's", link: "/docs/browser-apis" },
					{ text: "UI Slots", link: "/docs/ui-slots" },
					{ text: "Styling Components", link: "/docs/styling" },
				],
			},
			{
				text: "Components",
				link: "/docs/components",
				items: [
					{ text: "Image", link: "/docs/components/image" },
					{ text: "Text", link: "/docs/components/text" },
					{
						text: "Layout",
						collapsed: true,
						items: [
							{ text: "Box", link: "/docs/components/box" },
							{ text: "Column", link: "/docs/components/column" },
							{ text: "Row", link: "/docs/components/row" },
						],
					},
					{
						text: "Form",
						collapsed: true,
						items: [
							{ text: "Button", link: "/docs/components/button" },
							{ text: "Checkbox", link: "/docs/components/checkbox" },
							{ text: "Field", link: "/docs/components/field" },
							{ text: "Textarea", link: "/docs/components/textarea" },
						],
					},
					{
						text: "Utilities",
						collapsed: true,
						items: [{ text: "Fragment", link: "/docs/components/fragment" }],
					},
				],
			},
			{
				text: "Examples",
				link: "/docs/examples",
				collapsed: true,
				items: [
					{
						text: "Age confirmation",
						link: "/docs/examples/age-confirmation",
					},
				],
			},
		],
	},
});
