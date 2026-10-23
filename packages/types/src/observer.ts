import type { NubeComponent } from "./components";

/**
 * A native element of the store's interface, named by the same key the
 * Customization API uses for it.
 *
 * - `"add-to-cart-button"` — the storefront's add-to-cart button.
 *
 * Only these elements can be watched: there is no way to watch an element by
 * selector, because an app has no access to the page and a selector would tie
 * it to the markup of one theme. The keys are what holds across themes, and
 * more are added as the platform learns to watch them.
 */
export type ObserverNativeTarget = "add-to-cart-button";

/**
 * A component this app rendered, as the same JSX it passed to `render`.
 *
 * It is found on the page by the id the SDK derives from its type and props,
 * so the same component object, or one built with the same props, points to
 * the same element. Children made of other components count only as "has
 * children", not by their content, so two `<Box>` with different contents and
 * no other props share an id. Give the component a distinctive prop — an `id`
 * is the usual one — to be sure the watch follows it and not a sibling:
 *
 * ```tsx
 * const banner = (
 *   <Box id="promo-banner">
 *     <Text>Free shipping</Text>
 *   </Box>
 * );
 * ```
 *
 * Re-rendering with other props makes it another component, with another id:
 * the old watch then reports `present: false`, and the new one is watched
 * again.
 *
 * Typed as any `NubeComponent` because that is the type of every JSX
 * expression, but a component needs an element of its own on the page: a bare
 * string, which is rendered as text inside its parent, and a fragment, whose
 * children go straight into the parent, are refused with `invalid_input`.
 *
 * The `string` member of `NubeComponent` is spelled `string & {}` here: it
 * still accepts every JSX expression, but keeps TypeScript from collapsing
 * `ObserverNativeTarget` into `string`, so editors suggest the native keys.
 */
export type ObserverComponentTarget =
	| Exclude<NubeComponent, string>
	| (string & {});

/**
 * Where a watched element is, vertically, relative to the viewport.
 *
 * - `above` — entirely above the top of the viewport: the shopper has
 *   scrolled past it.
 * - `inside` — at least partly between the top and the bottom of the
 *   viewport.
 * - `below` — entirely below the bottom of the viewport: the shopper has not
 *   reached it yet.
 *
 * Only the vertical axis counts, so an element can be `inside` and still not
 * {@link ObserverEntry.visible} — the off-screen card of a carousel, say.
 */
export type ObserverPosition = "above" | "inside" | "below";

/**
 * The state of a watched target, delivered to the {@link ObserverCallback}
 * whenever it changes.
 *
 * Every entry is a complete picture, not a diff: an app reads the fields it
 * cares about and ignores the rest.
 */
export type ObserverEntry = {
	/**
	 * Whether the target is on the page right now. A target the page does not
	 * have yet — a component not rendered, a theme without the element — is `false`, and turns `true` when it appears. The same watch
	 * follows the target when the store renders it again, as some themes do on
	 * a variant selection.
	 */
	present: boolean;
	/** Whether any part of the target is inside the viewport. */
	visible: boolean;
	/**
	 * How much of the target is inside the viewport, from `0` to `1`. Reported
	 * at the crossings of {@link ObserverWatchOptions.threshold}, so it is not
	 * a continuous reading.
	 */
	ratio: number;
	/**
	 * Where the target is relative to the viewport. `null` while the target is
	 * not {@link present}, or is present but not displayed (`display: none`),
	 * so it takes no space on the page.
	 */
	position: ObserverPosition | null;
	/**
	 * The target's size in CSS pixels. `null` under the same conditions as
	 * {@link position}.
	 *
	 * Always filled when known, but a change of size alone only triggers the
	 * callback with {@link ObserverWatchOptions.size}.
	 */
	size: { width: number; height: number } | null;
};

/**
 * Receives the state of a watched target: once right after
 * {@link ObserverCommands.watch} resolves, with the state at that moment, and
 * again on every change, until {@link ObserverWatchResult} `unwatch` is called.
 *
 * It runs in the app, so it is free to call `render`, `clearSlot` or any
 * other API. An error it throws is logged and does not end the watch.
 */
export type ObserverCallback = (entry: ObserverEntry) => void;

export type ObserverWatchOptions = {
	/**
	 * The fractions of the target, from `0` to `1`, whose crossing triggers the
	 * callback, as in an `IntersectionObserver`. `0` fires when the first or
	 * the last pixel crosses the edge of the viewport, `1` when the target
	 * becomes fully visible or stops being so. Defaults to `0`.
	 *
	 * A change of {@link ObserverEntry.present} or
	 * {@link ObserverEntry.position} always triggers the callback, whatever
	 * the thresholds.
	 */
	threshold?: number | number[];
	/**
	 * Whether a change of size alone triggers the callback. Defaults to
	 * `false`, since most apps only care about where the target is.
	 */
	size?: boolean;
};

/**
 * Why a watch was turned down.
 *
 * - `invalid_input` — the call itself is malformed: a string that is not a
 *   native target, a fragment, a component without an id, a threshold
 *   outside `0`–`1` (or more than 20 of them), a callback that is not a
 *   function.
 * - `unknown_target` — the native target is not one the platform can watch.
 *   Older platforms know fewer targets, so this is the code to feature-detect
 *   on.
 * - `not_supported` — the host cannot watch this target, e.g. a storefront
 *   element on the checkout.
 * - `refused` — the component belongs to another app, or the app already
 *   holds 50 watches: `unwatch` one first. Native targets can be watched by any
 *   app.
 * - `bridge_error` — the command never reached the page, or failed on the way
 *   back. Comes with `error`.
 *
 * A target missing from the page is not a failure: the watch starts with
 * {@link ObserverEntry.present} `false`.
 */
export type ObserverFailureCode =
	| "invalid_input"
	| "unknown_target"
	| "not_supported"
	| "refused"
	| "bridge_error";

/**
 * The outcome of {@link ObserverCommands.watch}.
 *
 * `watch` never rejects: everything that can go wrong comes back here, so a
 * watch is checked by branching on `ok`.
 */
export type ObserverWatchResult =
	| {
			ok: true;
			/**
			 * Ends the watch. The callback is not called again once it returns,
			 * even for a change already on its way. Calling it more than once is a
			 * no-op.
			 */
			unwatch(): void;
	  }
	| {
			ok: false;
			/** What went wrong, for the app to branch on. */
			code: ObserverFailureCode;
			/** The same thing in words, ready to log. Always present. */
			reason: string;
			/**
			 * Only set when `code` is `bridge_error`: an `Error` cannot cross the
			 * worker boundary, so a watch refused on the page reports a `reason`
			 * alone.
			 */
			error?: Error;
	  };

/**
 * Worker-facing adapter for following targets on the page — whether they are
 * there, whether the shopper can see them, where they are and how big —
 * exposed on `NubeSDK` as `nube.api.getObserver()`.
 *
 * It only reads: watching a target changes nothing on the page. It is about
 * targets on the page; changes to the SDK state (the cart, the location)
 * still arrive through `nube.on`.
 */
export type ObserverCommands = {
	/**
	 * Follows a target on the page, calling `callback` with its state right
	 * away and then on every change, until `unwatch` is called.
	 *
	 * The target can be:
	 *
	 * - a native element of the store, by its {@link ObserverNativeTarget} key;
	 * - a component this app rendered — the same component object, or one
	 *   built with the same props.
	 *
	 * When the page has several instances of a native target — product grids,
	 * quick shop — the first one rendered, in page order, is watched.
	 *
	 * A watch lasts until `unwatch` or until the page unloads. It survives a
	 * target that leaves the page and comes back, so there is no need to watch
	 * again on `location:updated` or after a re-render.
	 *
	 * ```ts
	 * const observer = nube.api.getObserver();
	 *
	 * // show the bar only once the shopper has scrolled past the native button
	 * const result = await observer.watch("add-to-cart-button", (entry) => {
	 *   if (entry.present && entry.position === "above") {
	 *     nube.render("corner_bottom_right", <ActionBar />);
	 *   } else {
	 *     nube.clearSlot("corner_bottom_right");
	 *   }
	 * });
	 *
	 * if (!result.ok) console.warn(result.reason);
	 * ```
	 *
	 * On a platform that predates it, the call resolves with `ok: false` and
	 * `code: "bridge_error"`.
	 *
	 * @param target — What to watch.
	 * @param callback — Receives the target's state on every change.
	 * @param options — Which changes trigger the callback.
	 */
	watch(
		target: ObserverNativeTarget | ObserverComponentTarget,
		callback: ObserverCallback,
		options?: ObserverWatchOptions,
	): Promise<ObserverWatchResult>;
};
