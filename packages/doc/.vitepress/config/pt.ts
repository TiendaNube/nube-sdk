import { defineConfig } from "vitepress";

export const pt = defineConfig({
	lang: "pt",
	description: "A forma mais rápida de criar seu app na Nuvemshop",

	themeConfig: {
		nav: [
			{ text: "Home", link: "/pt" },
			{ text: "Exemplos", link: "/examples" },
		],

		sidebar: [
			{
				text: "Introduction",
				items: [
					{ text: "Comece agora", link: "/pt/getting-started" },
					{ text: "Examples", link: "/examples" },
				],
			},
		],
	},
});
