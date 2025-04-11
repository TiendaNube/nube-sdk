import { defineConfig } from "vitepress";

export const es = defineConfig({
	lang: "es",
	description: "La forma más rápida de crear tu app en Tiendanube",

	themeConfig: {
		nav: [
			{ text: "Home", link: "/" },
			{ text: "Ejemplos", link: "/examples" },
		],

		sidebar: [
			{
				text: "Introduction",
				items: [
					{ text: "Empezar ahora", link: "/getting-started" },
					{ text: "Runtime API Examples", link: "/examples" },
				],
			},
			{
				text: "Examples",
				link: "",
				items: [{ text: "Empezar ahora", link: "/getting-started" }],
			},
		],
	},
});
