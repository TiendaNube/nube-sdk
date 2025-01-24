import type { AsyncNubeStorage } from "./storage";

export type NubeBrowserAPIs = {
	asyncLocalStorage: AsyncNubeStorage;
	asyncSessionStorage: AsyncNubeStorage;
};
