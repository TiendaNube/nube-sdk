import { defineManifest } from "@crxjs/vite-plugin";
import packageData from "../package.json";

const isDev = process.env.NODE_ENV === "development";

export default defineManifest({
	name: `NubeSDK DevTools${isDev ? " - DEV" : ""}`,
	description: packageData.description,
	version: packageData.version,
	manifest_version: 3,
	icons: {
		16: "logo/logo-16.png",
		32: "logo/logo-32.png",
		48: "logo/logo-48.png",
		128: "logo/logo-128.png",
	},
	devtools_page: "devtools.html",
	background: {
		service_worker: "src/background/index.ts",
		type: "module",
	},
	action: {
		default_icon: {
			16: "logo/logo-16.png",
			32: "logo/logo-32.png",
			48: "logo/logo-48.png",
			128: "logo/logo-128.png",
		},
		default_title: "NubeSDK DevTools",
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
				"logo/logo-16.png",
				"logo/logo-32.png",
				"logo/logo-48.png",
				"logo/logo-128.png",
				"logo-off/logo-16.png",
				"logo-off/logo-32.png",
				"logo-off/logo-48.png",
				"logo-off/logo-128.png",
				"logo-on/logo-16.png",
				"logo-on/logo-32.png",
				"logo-on/logo-48.png",
				"logo-on/logo-128.png",
			],
			matches: [],
		},
	],
	permissions: ["scripting", "activeTab", "tabs"],
	host_permissions: ["http://*/*", "https://*/*"],
});
