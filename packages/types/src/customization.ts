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
};

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
 * Worker-facing adapter for customizing native elements of the store's
 * interface, exposed on `NubeSDK` as `nube.api.getCustomization()`.
 *
 * Both methods cross the worker / main thread boundary via the internal
 * command channel and return Promises. Errors arrive as standard `Error`
 * instances with messages in the form `"<code>: <message>"`, where `<code>`
 * is one of `unknown_command`, `command_failed`, or `timeout`.
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
	 * await customization.set("add-to-cart-button", cta);
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
	): Promise<void>;
	/**
	 * Customizes several targets at once, with the same semantics as the
	 * single-target form.
	 *
	 * @param input — Options per target; at least one target is required.
	 */
	set(input: CustomizationInput): Promise<void>;
	/**
	 * Restores the store's original values for one target, including any
	 * option the app had changed.
	 *
	 * A target that was never customized is a no-op.
	 *
	 * @param target — The element to restore.
	 */
	reset(target: CustomizationTarget): Promise<void>;
	/**
	 * Restores the store's original values for several targets at once.
	 *
	 * @param targets — The elements to restore.
	 */
	reset(targets: CustomizationTarget[]): Promise<void>;
};
