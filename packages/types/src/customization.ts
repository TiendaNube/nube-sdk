/**
 * Every customization option an app can ask for, declared once.
 *
 * This is the vocabulary of the Customization API: each target in
 * {@link Customization} picks the subset of options it supports, so an option
 * is described here a single time and the per-target types stay in sync with
 * it.
 *
 * Options are added here as the API grows, and a target only accepts an option
 * once the host knows how to apply it to that element.
 */
export type CustomizationOptions = {
	/**
	 * The element's visible label.
	 *
	 * Always applied as text, never as markup — tags in the string are shown
	 * literally rather than parsed.
	 *
	 * Refused when blank: a label of `""` or only whitespace leaves the element
	 * unusable for a shopper.
	 */
	text: string;
	/**
	 * The colour of the element's text, applied as an inline style. Pass `""`
	 * to drop the inline colour and hand the element back to the theme.
	 *
	 * Only hex, `rgb()`, `rgba()`, `hsl()` and `hsla()` are accepted. Named
	 * colours and context-dependent values such as `var(--brand)` or
	 * `currentColor` are refused, because the platform checks the colour
	 * against the element's actual background before applying it and those
	 * notations are only resolved by the browser afterwards — accepting one
	 * would mean applying a colour that was never verified. Send a concrete
	 * colour instead.
	 *
	 * Also refused when the resulting contrast would fall below 3:1 (WCAG's bar
	 * for large text and non-text UI), which is what keeps a customization from
	 * making the label vanish into its own background.
	 */
	fontColor: string;
	/**
	 * Whether the element is hidden, and on which viewports:
	 *
	 * - `"always"` — hidden on every viewport;
	 * - `"mobile"` — hidden below 768px only;
	 * - `"desktop"` — hidden from 768px up only;
	 * - `"never"` — not hidden, i.e. shown as the store renders it. Pass this
	 *   to undo a previous value without restoring the target's other options,
	 *   the way `""` undoes {@link CustomizationOptions.fontColor}.
	 *
	 * Applied through a stylesheet the platform owns rather than an inline
	 * style, which is what makes it outlast the store's own code: a theme that
	 * shows or hides the same element — as it does when a shopper selects a
	 * variant — does not undo it, so this option usually does not need the
	 * re-applying that {@link CustomizationCommands.set} describes. `"never"`
	 * hands the element back to the theme instead of pinning it visible.
	 *
	 * 768px is the breakpoint the platform's themes are built on. A theme with
	 * different breakpoints of its own still hides at this one.
	 *
	 * Refused when the value is not one of the four above.
	 */
	hidden: CustomizationHiddenMode;
};

/**
 * The values {@link CustomizationOptions.hidden} accepts, named so an app can
 * type a mode it computes — from its own settings, say — without repeating the
 * union.
 */
export type CustomizationHiddenMode = "always" | "mobile" | "desktop" | "never";

/**
 * Requires at least one of `T`'s members while leaving the others optional.
 */
type AtLeastOne<T> = {
	[K in keyof T]-?: Required<Pick<T, K>> & Partial<Omit<T, K>>;
}[keyof T];

/**
 * Narrows {@link CustomizationOptions} to the options a given target accepts,
 * of which at least one must be present.
 *
 * An app customizing a target that supports several options may send only the
 * one it cares about — the others are left as the store renders them — but an
 * empty `{}` is not a valid call.
 */
type AllowedCustomizationOptions<T extends keyof CustomizationOptions> =
	AtLeastOne<Pick<CustomizationOptions, T>>;

/**
 * The catalog of customizable native elements, keyed by target name.
 *
 * A target is a stable name for an element the platform renders (as opposed to
 * a slot, which is a place where an app renders its own components). The
 * catalog is what makes the API typed end to end: the options accepted by each
 * target are declared here, and an unknown target is a type error at the call
 * site.
 *
 * Only elements listed here can be customized. A target the current page does
 * not have — a theme whose markup diverges, or a target belonging to the other
 * host — resolves successfully and logs a warning, as does a value a rule
 * refuses, so an app never breaks because of the store it happens to run on.
 */
export type Customization = {
	/**
	 * The storefront's add-to-cart button, on product pages and product grids.
	 *
	 * Every instance on the page is customized. `fontColor` applies on any
	 * theme; `text` applies on the themes that render the button as a form
	 * input, which is most of them, and is ignored where a theme builds the
	 * label differently.
	 */
	"add-to-cart-button": AllowedCustomizationOptions<"text" | "fontColor">;
	/**
	 * The storefront's installments panel: the payments block of the product
	 * page, which shows the instalment the product can be paid in and opens the
	 * store's payment-methods modal when tapped.
	 *
	 * It is the block as a whole — the payment discount, the instalment line,
	 * the card logos and the link that opens the modal — so hiding it removes
	 * the payment information from the product page without touching the
	 * instalments shown on product grids.
	 *
	 * Present on every theme that supports the SDK, and on product pages only.
	 */
	"installments-panel": AllowedCustomizationOptions<"hidden">;
};

/**
 * The name of a customizable element — the key an app passes to
 * {@link CustomizationCommands.set} and
 * {@link CustomizationCommands.reset}.
 */
export type CustomizationTarget = keyof Customization;

/**
 * A set of customizations addressed by target — the argument of a bulk
 * {@link CustomizationCommands.set}. At least one target is required.
 */
export type CustomizationInput = AtLeastOne<Customization>;

/**
 * Why a {@link CustomizationCommands.set} or
 * {@link CustomizationCommands.reset} call did not take effect.
 *
 * The code is the part an app branches on; {@link CustomizationResult.reason}
 * is the same thing in words, for a log. Each code calls for a different
 * reaction, which is why they are distinguished:
 *
 * - `invalid_input` — the payload or the options were malformed. A bug in the
 *   app, fixable in the call itself.
 * - `unknown_target` — the target is not in the platform's catalog. Older
 *   platforms know fewer targets, so this is the code to feature-detect on.
 * - `not_found` — the target exists but the current page has no such element,
 *   as happens on a theme whose markup diverges. Nothing to retry with the
 *   same value on this page.
 * - `refused` — a rule rejected the value, e.g. a font colour that would not
 *   be readable on the element's background. The `reason` carries the
 *   measurement, so an app can correct the value and call again.
 * - `bridge_error` — the command never reached the page, or failed on the way
 *   back. Comes with {@link CustomizationResult.error}.
 */
export type CustomizationFailureCode =
	| "invalid_input"
	| "unknown_target"
	| "not_found"
	| "refused"
	| "bridge_error";

/**
 * The outcome of a {@link CustomizationCommands.set} or
 * {@link CustomizationCommands.reset} call.
 *
 * Neither method rejects: everything that can go wrong comes back here, so a
 * customization is checked by branching on the result rather than by wrapping
 * the call in `try`/`catch`:
 *
 * ```ts
 * const result = await customization.set("add-to-cart-button", options);
 *
 * if (!result.ok) {
 *   if (result.code === "refused") console.warn("bad value:", result.reason);
 *   return;
 * }
 * ```
 *
 * It is a union so that `ok` narrows: inside `if (!result.ok)`, `reason` is a
 * `string` and `code` is always there, with no optional-chaining ceremony.
 */
export type CustomizationResult =
	| {
			ok: true;
			/**
			 * How many elements were customized. A target can appear more than
			 * once on a page — the platform applies the customization to every
			 * instance it finds.
			 */
			applied: number;
			/**
			 * How many matching elements a rule turned down while others were
			 * customized. Usually `0`. A theme that keeps a hidden twin of an
			 * element (a disabled placeholder beside the real button, say) can
			 * report `applied: 1, refused: 1`, which is still a success: the
			 * element a shopper sees was customized.
			 *
			 * An app that wants all-or-nothing checks `refused === 0` — the
			 * platform deliberately does not impose that.
			 */
			refused: number;
	  }
	| {
			ok: false;
			/** What went wrong, for the app to branch on. */
			code: CustomizationFailureCode;
			/** The same thing in words, ready to log. Always present. */
			reason: string;
			/**
			 * Only set when `code` is `bridge_error`: an `Error` cannot cross
			 * the worker boundary, so a value refused on the page reports a
			 * `reason` alone.
			 */
			error?: Error;
	  };

/**
 * Worker-facing adapter for customizing native elements of the store's
 * interface, exposed on `NubeSDK` as `nube.api.getCustomization()`.
 *
 * Both methods cross the worker / main thread boundary via the internal
 * command channel and resolve with a {@link CustomizationResult}. Neither
 * rejects, so there is nothing to catch: a failure of the channel itself
 * arrives as `ok: false` carrying the `Error` in `error`.
 */
export type CustomizationCommands = {
	/**
	 * Customizes a single target, applying the options to every matching
	 * element on the page.
	 *
	 * Changes only what is on the screen when it runs: an element that appears
	 * later is not customized, and the store's own code may rewrite the element
	 * and drop the change — a theme rewrites the add-to-cart label when the
	 * shopper selects a variant, for instance. Both moments are announced by
	 * events, so an app that wants the customization to persist re-applies it
	 * there:
	 *
	 * ```ts
	 * const customization = nube.api.getCustomization();
	 * const cta = { text: "Buy now", fontColor: "#111111" };
	 *
	 * const result = await customization.set("add-to-cart-button", cta);
	 * if (!result.ok) console.warn(result.reason);
	 *
	 * // the theme rewrites the label on variant selection
	 * nube.on("product:variant_selected", () => {
	 *   customization.set("add-to-cart-button", cta);
	 * });
	 *
	 * // new products appended to a grid (pagination, infinite scroll)
	 * nube.on("location:updated", () => {
	 *   customization.set("add-to-cart-button", cta);
	 * });
	 * ```
	 *
	 * Calling it repeatedly is safe: the element's original values are captured
	 * the first time it is customized, so `reset` still restores what the store
	 * itself renders.
	 *
	 * @param target — The element to customize.
	 * @param options — The options for that target, narrowed to the ones it
	 *   accepts; at least one is required.
	 */
	set<K extends CustomizationTarget>(
		target: K,
		options: Customization[K],
	): Promise<CustomizationResult>;
	/**
	 * Customizes several targets at once, with the same semantics as the
	 * single-target form.
	 *
	 * @param input — Options per target; at least one target is required.
	 */
	set(input: CustomizationInput): Promise<CustomizationResult>;
	/**
	 * Restores the store's original values for one target, including any
	 * option the app had changed.
	 *
	 * A target that was never customized is a no-op.
	 *
	 * @param target — The element to restore.
	 */
	reset(target: CustomizationTarget): Promise<CustomizationResult>;
	/**
	 * Restores the store's original values for several targets at once.
	 *
	 * @param targets — The elements to restore.
	 */
	reset(targets: CustomizationTarget[]): Promise<CustomizationResult>;
};
