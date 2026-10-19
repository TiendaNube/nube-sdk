/**
 * Schema.org `AggregateRating` as an app supplies it for a product: the
 * average of its reviews and how many there are.
 *
 * The host adds `"@type": "AggregateRating"` itself, so the app sends only the
 * values. At least one of `reviewCount` and `ratingCount` is required, as
 * search engines require for review rich results.
 */
export type StructuredDataAggregateRating = {
	/**
	 * The average rating, between `worstRating` and `bestRating`.
	 */
	ratingValue: number;
	/**
	 * The highest value allowed in this rating system. Defaults to `5`.
	 */
	bestRating?: number;
	/**
	 * The lowest value allowed in this rating system. Defaults to `1`.
	 */
	worstRating?: number;
} & (
	| {
			/** How many reviews the rating is based on. A positive integer. */
			reviewCount: number;
			/** How many ratings the rating is based on. A positive integer. */
			ratingCount?: number;
	  }
	| {
			/** How many reviews the rating is based on. A positive integer. */
			reviewCount?: number;
			/** How many ratings the rating is based on. A positive integer. */
			ratingCount: number;
	  }
);

/**
 * Central capability interface. Every Schema.org property an app can
 * contribute lives here exactly once; each target in {@link StructuredData}
 * then picks the subset it supports.
 *
 * Only `aggregateRating` ships today. Other properties (e.g. `review`) are
 * added here as the platform learns to merge them.
 */
export type StructuredDataProperties = {
	/**
	 * The product's rating, rendered by the host as the Schema.org
	 * `aggregateRating` of the node.
	 */
	aggregateRating: StructuredDataAggregateRating;
};

/**
 * Requires at least one of `T`'s members while leaving the others optional.
 */
type AtLeastOne<T> = {
	[K in keyof T]-?: Required<Pick<T, K>> & Partial<Omit<T, K>>;
}[keyof T];

/**
 * Narrows {@link StructuredDataProperties} to the properties a given target
 * accepts, of which at least one must be present.
 */
type AllowedStructuredDataProperties<T extends keyof StructuredDataProperties> =
	AtLeastOne<Pick<StructuredDataProperties, T>>;

/**
 * The catalog of structured data nodes an app can contribute to, keyed by
 * target name.
 *
 * The platform renders the page's Schema.org JSON-LD itself; an app never
 * adds a node of its own. It supplies values, and the platform merges them
 * into the node it already emits, so there is always one node per entity
 * and no competing copies.
 */
export type StructuredData = {
	/**
	 * The main product of the product page: the `Product` (or, for a product
	 * with variants, the `ProductGroup`) the page is about. The products of
	 * related-products strips and other cards on the page are not affected.
	 *
	 * Only available on product pages. Elsewhere the call resolves with
	 * `not_found`.
	 *
	 * ```ts
	 * await nube.api.getStructuredData().set("product", {
	 *   aggregateRating: { ratingValue: 4.7, reviewCount: 128 },
	 * });
	 * ```
	 */
	product: AllowedStructuredDataProperties<"aggregateRating">;
};

/**
 * The name of a structured data node — the key an app passes to
 * {@link StructuredDataCommands.set}.
 */
export type StructuredDataTarget = keyof StructuredData;

/**
 * Why a {@link StructuredDataCommands.set} call did not take effect.
 *
 * - `invalid_input` — the payload or a value was malformed, e.g. a
 *   `ratingValue` outside `worstRating`..`bestRating`. A bug in the app,
 *   fixable in the call itself.
 * - `unknown_target` — the target or one of the properties is not supported
 *   by the platform. Older platforms support fewer, so this is the code to
 *   feature-detect on.
 * - `not_found` — the current page has no such node: it is not a product
 *   page, or the product is not published with structured data.
 * - `bridge_error` — the command never reached the page, or failed on the way
 *   back. Comes with {@link StructuredDataResult.error}.
 */
export type StructuredDataFailureCode =
	| "invalid_input"
	| "unknown_target"
	| "not_found"
	| "bridge_error";

/**
 * The outcome of a {@link StructuredDataCommands.set} call.
 *
 * `set` never rejects: everything that can go wrong comes back here, so an app
 * branches on `ok` rather than wrapping the call in `try`/`catch`.
 */
export type StructuredDataResult =
	| { ok: true }
	| {
			ok: false;
			/** What went wrong, for the app to branch on. */
			code: StructuredDataFailureCode;
			/** The same thing in words, for a log. */
			reason: string;
			/** The underlying error, when `code` is `bridge_error`. */
			error?: Error;
	  };

/**
 * Worker-facing adapter for contributing to the page's Schema.org structured
 * data (JSON-LD).
 *
 * Crosses the worker / main thread boundary via the internal command channel
 * and returns Promises. The app supplies the data; the platform validates it
 * and writes it into the JSON-LD it already renders, on the main thread.
 */
export type StructuredDataCommands = {
	/**
	 * Sets properties of a structured data node.
	 *
	 * Each property sent replaces the one the node had, including one the
	 * platform rendered itself; properties not sent are left as they are.
	 * Calling `set` again with the same property replaces it again.
	 *
	 * @param target — The node to change, e.g. `"product"`.
	 * @param properties — The properties to set on it.
	 */
	set<K extends StructuredDataTarget>(
		target: K,
		properties: StructuredData[K],
	): Promise<StructuredDataResult>;
};
