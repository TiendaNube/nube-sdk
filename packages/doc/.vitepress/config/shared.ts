import { defineConfig } from "vitepress";

export const shared = defineConfig({
	title: "NubeSDK",

	themeConfig: {
		socialLinks: [{ icon: "github", link: "https://github.com/tiendanube" }],

		logo: "/images/nuvemshop.png",
	},
});
