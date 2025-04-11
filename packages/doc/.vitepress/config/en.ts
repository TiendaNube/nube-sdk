import { defineConfig } from "vitepress";

export const en = defineConfig({
	lang: "en",
	description: "The fastest way to create your app on Nuvemshop",

	themeConfig: {
		nav: [
			{ text: "Docs", link: "/docs/motivation" },
			{ text: "Components", link: "/docs/components" },
		],
		sidebar: [
			{
				text: "Concepts",
				collapsed: false,
				items: [
					{ text: "Motivation", link: "/docs/motivation" },
					{ text: "Secure by Design", link: "/docs/secure-by-design" },
					{ text: "Built for the Modern Web", link: "/docs/built-for-modern-web" },
					{ text: "Developer First", link: "/docs/developer-first" },
				],
			},
			{
				text: "Getting Started",
				collapsed: false,
				items: [
					{ text: "Creating a new App", link: "/docs/getting-started" },
					{ text: "The App State", link: "/docs/state" },
					{ text: "Events", link: "/docs/events" },
					{ text: "Browser API's", link: "/docs/browser-apis" },
					{ text: "UI Slots", link: "/docs/ui-slots" },
				],
			},
			{
				text: "Components",
				link: "/docs/components",
				items: [
					{ "text": "Image", "link": "/docs/components/image" },
					{ "text": "Text", "link": "/docs/components/text" },
					{
						text: "Layout",
						collapsed: true,
						items: [
							{ "text": "Box", "link": "/docs/components/box" },
							{ "text": "Col", "link": "/docs/components/col" },
							{ "text": "Row", "link": "/docs/components/row" },
						],
					},
					{
						text: "Form",
						collapsed: true,
						items: [
							{ "text": "Button", "link": "/docs/components/button" },
							{ "text": "Check", "link": "/docs/components/check" },
							{ "text": "Field", "link": "/docs/components/field" },
							{ "text": "TextArea", "link": "/docs/components/textarea" },
						],
					},
					{
						text: "Utilities",
						collapsed: true,
						items: [
							{ "text": "Fragment", "link": "/docs/components/fragment" },
						]
					},
				],
			},
			{
				text: "Examples",
				link: "/examples",
				collapsed: true,
				items: [
					{ text: "Age confirmation App", link: "/examples/age-confirmation" },
				],
			},
		],
	},
});
