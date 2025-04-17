import { defineConfig } from "vitepress";

export const es = defineConfig({
	lang: "es",
	description: "La forma más rápida de crear tu app en Tiendanube",

	themeConfig: {
		nav: [
			{ text: "Documentación", link: "/es/docs/motivation" },
			{ text: "Componentes", link: "/es/docs/components" },
			{ text: "Ejemplos", link: "/es/docs/examples" },
		],
		sidebar: [
			{
				text: "Conceptos",
				collapsed: false,
				items: [
					{ text: "Motivación", link: "/es/docs/motivation" },
					{ text: "Seguro por Diseño", link: "/es/docs/secure-by-design" },
					{ text: "Súper Rápido", link: "/es/docs/lightning-fast" },
					{
						text: "Hecho para la Web Moderna",
						link: "/es/docs/built-for-modern-web",
					},
					{
						text: "Pensado para Desarrolladores",
						link: "/es/docs/developer-first",
					},
				],
			},
			{
				text: "Comenzando",
				collapsed: false,
				items: [
					{ text: "Creando una nueva App", link: "/es/docs/getting-started" },
					{ text: "DevTools", link: "/es/docs/devtools" },
					{ text: "El Estado de la App", link: "/es/docs/state" },
					{ text: "Eventos", link: "/es/docs/events" },
					{ text: "APIs del Navegador", link: "/es/docs/browser-apis" },
					{ text: "Slots de UI", link: "/es/docs/ui-slots" },
				],
			},
			{
				text: "Componentes",
				link: "/es/docs/components",
				items: [
					{ text: "Image", link: "/es/docs/components/image" },
					{ text: "Text", link: "/es/docs/components/text" },
					{
						text: "Layout",
						collapsed: true,
						items: [
							{ text: "Box", link: "/es/docs/components/box" },
							{ text: "Column", link: "/es/docs/components/column" },
							{ text: "Row", link: "/es/docs/components/row" },
						],
					},
					{
						text: "Form",
						collapsed: true,
						items: [
							{ text: "Button", link: "/es/docs/components/button" },
							{ text: "Checkbox", link: "/es/docs/components/checkbox" },
							{ text: "Field", link: "/es/docs/components/field" },
							{ text: "Textarea", link: "/es/docs/components/textarea" },
						],
					},
					{
						text: "Utilities",
						collapsed: true,
						items: [{ text: "Fragment", link: "/es/docs/components/fragment" }],
					},
				],
			},
			{
				text: "Ejemplos",
				link: "/es/docs/examples",
				collapsed: true,
				items: [
					{
						text: "App de Confirmación de Edad",
						link: "/es/docs/examples/age-confirmation",
					},
				],
			},
		],
	},
});
