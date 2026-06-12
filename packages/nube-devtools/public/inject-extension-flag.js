(function () {
	Object.defineProperty(window, "__NUBE_DEVTOOLS_EXTENSION__", {
		get: function () {
			return true;
		},
		configurable: true,
		enumerable: true,
	});
})();
