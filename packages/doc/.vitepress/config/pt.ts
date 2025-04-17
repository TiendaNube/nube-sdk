import { defineConfig } from "vitepress";

export const pt = defineConfig({
	lang: "pt",
	description: "A forma mais rápida de criar seu app na Nuvemshop",

	themeConfig: {
		nav: [
			{ text: "Documentação", link: "/pt/docs/motivation" },
			{ text: "Componentes", link: "/pt/docs/components" },
			{ text: "Exemplos", link: "/pt/docs/examples" },
		],
		sidebar: [
			{
				text: "Conceitos",
				collapsed: false,
				items: [
					{ text: "Motivação", link: "/pt/docs/motivation" },
					{ text: "Seguro por Design", link: "/pt/docs/secure-by-design" },
					{ text: "Extremamente Rápido", link: "/pt/docs/lightning-fast" },
					{
						text: "Feito para a Web Moderna",
						link: "/pt/docs/built-for-modern-web",
					},
					{
						text: "Pensado para Devs",
						link: "/pt/docs/developer-first",
					},
				],
			},
			{
				text: "Começando",
				collapsed: false,
				items: [
					{ text: "Criando um novo App", link: "/pt/docs/getting-started" },
					{ text: "Estado do App", link: "/pt/docs/state" },
					{ text: "Eventos", link: "/pt/docs/events" },
					{ text: "APIs do Navegador", link: "/pt/docs/browser-apis" },
					{ text: "Slots de UI", link: "/pt/docs/ui-slots" },
				],
			},
			{
				text: "Componentes",
				link: "/pt/docs/components",
				items: [
					{ text: "Image", link: "/pt/docs/components/image" },
					{ text: "Text", link: "/pt/docs/components/text" },
					{
						text: "Layout",
						collapsed: true,
						items: [
							{ text: "Box", link: "/pt/docs/components/box" },
							{ text: "Column", link: "/pt/docs/components/column" },
							{ text: "Row", link: "/pt/docs/components/row" },
						],
					},
					{
						text: "Form",
						collapsed: true,
						items: [
							{ text: "Button", link: "/pt/docs/components/button" },
							{ text: "Checkbox", link: "/pt/docs/components/checkbox" },
							{ text: "Field", link: "/pt/docs/components/field" },
							{ text: "Textarea", link: "/pt/docs/components/textarea" },
						],
					},
					{
						text: "Utilities",
						collapsed: true,
						items: [{ text: "Fragment", link: "/pt/docs/components/fragment" }],
					},
				],
			},
			{
				text: "Exemplos",
				link: "/pt/docs/examples",
				collapsed: true,
				items: [
					{
						text: "Confirmação de Idade",
						link: "/pt/docs/examples/age-confirmation",
					},
				],
			},
		],
	},
});
