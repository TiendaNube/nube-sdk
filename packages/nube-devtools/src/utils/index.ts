/**
 * Utility functions for the Nube DevTools extension
 */

export { getBrowserTheme } from "./utils";
export { formatTsx, cleanSvgCode, convertSvgToNubeSDK } from "./formatters";
export { copyToClipboard, downloadFile } from "./file-utils";
export { getModifiedPaths } from "./json-diff";
export {
	setPageSessionStorage,
	getPageSessionStorage,
	removePageSessionStorage,
	readPageStorage,
	getPageStorage,
	setPageStorage,
	removePageStorage,
	type PageStorageEntry,
	type PageStorageType,
} from "./page-storage";
export {
	type StorageValueEncoding,
	type UnwrappedStorageValue,
	unwrapStorageValue,
	type WrapResult,
	wrapStorageValue,
} from "./storage-value";
export {
	STORAGE_KEY_PATTERN,
	STORAGE_KEY_PATTERN_SOURCE,
	parseStorageKey,
	type ParsedStorageKey,
} from "./storage-key";
