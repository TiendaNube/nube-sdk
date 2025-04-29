import { defineConfig } from "vitepress";

export const shared = defineConfig({
	title: "NubeSDK",

	head: [["link", { rel: "icon", href: "/images/nuvemshop.png" }]],
	themeConfig: {
		socialLinks: [{ icon: "github", link: "https://github.com/tiendanube" }],

		logo: "/images/nuvemshop.png",
	},
});
