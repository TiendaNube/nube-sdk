import { defineManifest } from "@crxjs/vite-plugin";
import packageData from "../package.json";

const isDev = process.env.NODE_ENV === "development";
const isFirefox = process.env.BROWSER === "firefox";

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
	action: {
		default_popup: "popup.html",
		default_icon: "img/logo-48.png",
	},
	devtools_page: "devtools.html",
	// Firefox does not run MV3 service workers; it loads the same entry as a
	// non-persistent background script instead.
	background: isFirefox
		? { scripts: ["src/background/service-worker.ts"], type: "module" }
		: { service_worker: "src/background/service-worker.ts", type: "module" },
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
				"inject-extension-flag.js",
				"inject-performance-monitor.js",
			],
			// Firefox rejects an empty `matches`.
			matches: isFirefox ? ["http://*/*", "https://*/*"] : [],
		},
	],
	permissions: ["scripting", "activeTab", "declarativeNetRequest"],
	host_permissions: ["http://*/*", "https://*/*"],
	...(isFirefox && {
		browser_specific_settings: {
			gecko: {
				id: "nube-devtools@tiendanube.com",
				// First release with `world: "MAIN"` in the scripting API.
				strict_min_version: "128.0",
				data_collection_permissions: { required: ["none"] },
			},
		},
	}),
});
