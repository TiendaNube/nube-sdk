import { defineConfig } from "vitepress";
import { shared } from "./shared";
import { en } from "./en";
import { pt } from "./pt";
import { es } from "./es";

export default defineConfig({
	...shared,
	locales: {
		root: { label: "English", ...en },
		pt: { label: "Portugues", ...pt },
		es: { label: "Español", ...es },
	},
});
