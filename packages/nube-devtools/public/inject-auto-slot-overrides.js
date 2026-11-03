// Runs in the page at document_start, before the NubeSDK adapter. When the
// Auto-Slots tab has its overrides switched on for this store, they are handed
// to the auto-slots engine through window.__NUBE_SDK_AUTO_SLOT_OVERRIDES__,
// which the engine reads once, at DOMContentLoaded.
//
// Keep the key and the stored shape in sync with src/utils/auto-slots.ts.
(function () {
	var STORAGE_KEY = "nube-devtools-auto-slots";
	var OVERRIDES_GLOBAL = "__NUBE_SDK_AUTO_SLOT_OVERRIDES__";

	var stored;
	try {
		stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
	} catch (error) {
		return;
	}
	if (
		!stored ||
		stored.enabled !== true ||
		!stored.overrides ||
		typeof stored.overrides !== "object"
	) {
		return;
	}

	var devtoolsOverrides = stored.overrides;
	// Overrides the layout sets itself, later, in its own script.
	var pageOverrides = window[OVERRIDES_GLOBAL];

	// The DevTools ones go on top of the page's, field by field.
	function mergedOverrides() {
		if (!pageOverrides || typeof pageOverrides !== "object") {
			return devtoolsOverrides;
		}
		var merged = {};
		var slot;
		for (slot in pageOverrides) {
			merged[slot] = pageOverrides[slot];
		}
		for (slot in devtoolsOverrides) {
			merged[slot] = Object.assign(
				{},
				pageOverrides[slot],
				devtoolsOverrides[slot],
			);
		}
		return merged;
	}

	try {
		Object.defineProperty(window, OVERRIDES_GLOBAL, {
			configurable: true,
			enumerable: true,
			get: mergedOverrides,
			set: function (value) {
				pageOverrides = value;
			},
		});
	} catch (error) {
		// The page made the global non-configurable: leave it alone.
	}
})();
