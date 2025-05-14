import { defineManifest } from "@crxjs/vite-plugin";
import packageData from "../package.json";

const isDev = process.env.NODE_ENV === "development";

export default defineManifest({
	name: `NubeSDK DevTools${isDev ? " - DEV" : ""}`,
	description: packageData.description,
	version: packageData.version,
	manifest_version: 3,
	icons: {
		16: "img/logo-16.png",
		32: "img/logo-32.png",
		48: "img/logo-48.png",
		128: "img/logo-128.png",
	},
	devtools_page: "devtools.html",
	background: {
		service_worker: "src/background/index.ts",
		type: "module",
	},
	content_scripts: [
		{
			matches: ["http://*/*", "https://*/*"],
			js: ["src/contentScript/index.ts"],
			run_at: "document_start",
		},
	],
	web_accessible_resources: [
		{
			resources: [
				"img/logo-16.png",
				"img/logo-32.png",
				"img/logo-48.png",
				"img/logo-128.png",
			],
			matches: [],
		},
	],
	permissions: ["scripting", "activeTab"],
	host_permissions: ["http://*/*", "https://*/*"],
});
