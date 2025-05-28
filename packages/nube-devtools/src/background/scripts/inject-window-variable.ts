export const injectWindowVariable = () => {
	window.__NUBE_DEVTOOLS_EXTENSION__ = !!window.nubeSDK;
};
