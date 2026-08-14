export const HOME_NO_CACHE_COOKIE_NAME = "home_no_cache";
export const HOME_NO_CACHE_COOKIE_VALUE = "1";

/**
 * The storefront skips its edge cache when this cookie is present, so setting
 * it keeps DevTools sessions off cached HTML. Only its presence matters, and an
 * existing value is left untouched.
 */
export async function ensureHomeNoCacheCookie(url: string) {
	if (!url.startsWith("http")) {
		return;
	}

	try {
		const existing = await chrome.cookies.get({
			url,
			name: HOME_NO_CACHE_COOKIE_NAME,
		});

		if (existing) {
			return;
		}

		await chrome.cookies.set({
			url,
			name: HOME_NO_CACHE_COOKIE_NAME,
			value: HOME_NO_CACHE_COOKIE_VALUE,
			path: "/",
		});
	} catch (error) {
		console.error(
			`[NubeSDK DevTools] failed to set ${HOME_NO_CACHE_COOKIE_NAME} cookie`,
			error,
		);
	}
}
