import type { NubeStorage } from "./storage";

export type NubeBrowserAPIs = {
	localStorage: NubeStorage;
	sessionStorage: NubeStorage;
};
