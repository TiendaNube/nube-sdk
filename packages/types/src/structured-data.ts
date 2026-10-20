/**
 * The rating of one review, shaped like a Schema.org `Rating`.
 *
 * `bestRating` and `worstRating` default to the scale of the
 * `aggregateRating` sent in the same call.
 */
export type StructuredDataReviewRating = {
	/** The rating given in the review, between `worstRating` and `bestRating`. */
	ratingValue: number;
	/** The highest value allowed. Defaults to the aggregate's `bestRating`. */
	bestRating?: number;
	/** The lowest value allowed. Defaults to the aggregate's `worstRating`. */
	worstRating?: number;
};

/**
 * One review of the product, shaped like a Schema.org `Review` without its
 * `@type`s.
 *
 * The host renders it with the author as a `Person` and the rating as a
 * `Rating`. Fields not listed here are dropped.
 */
export type StructuredDataReview = {
	/** The reviewer. */
	author: {
		/**
		 * The reviewer's name. Up to 99 characters, as Google ignores author
		 * names of 100 or more.
		 */
		name: string;
	};
	/** The rating given in this review. */
	reviewRating: StructuredDataReviewRating;
	/**
	 * When the review was published, as an ISO 8601 date (`"2026-09-01"`) or
	 * date-time (`"2026-09-01T10:00:00-03:00"`).
	 */
	datePublished?: string;
	/**
	 * The text of the review. Up to 2000 characters.
	 */
	reviewBody?: string;
};

/**
 * The product's rating, shaped like a Schema.org `AggregateRating` without its
 * `@type`: the average of its reviews and how many there are.
 *
 * At least one of `reviewCount` and `ratingCount` is required, as search
 * engines require for review rich results.
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
 * contribute lives here exactly once, named and shaped as in the JSON-LD; each
 * target in {@link StructuredData} then picks the subset it supports.
 *
 * Other properties are added here as the platform learns to merge them.
 */
export type StructuredDataProperties = {
	/**
	 * The product's rating, rendered by the host as the Schema.org
	 * `aggregateRating` of the node.
	 */
	aggregateRating: StructuredDataAggregateRating;
	/**
	 * Up to 5 reviews of the product, rendered by the host as the Schema.org
	 * `review` list of the node.
	 *
	 * The reviews are a sample of the ones the `aggregateRating` counts, so it
	 * must be sent in the same call, and there can be no more reviews than its
	 * `reviewCount` (or `ratingCount` without it). An empty array adds no
	 * `review`.
	 */
	review: StructuredDataReview[];
};

/**
 * The catalog of structured data nodes an app can contribute to, keyed by
 * target name. Each one takes its properties as the JSON-LD names and nests
 * them.
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
	 * Takes an `aggregateRating`, and optionally a `review` list next to it.
	 *
	 * Only available on product pages. Elsewhere the call resolves with
	 * `not_found`.
	 *
	 * ```ts
	 * await nube.api.getStructuredData().add("product", {
	 *   aggregateRating: { ratingValue: 4.7, reviewCount: 128 },
	 *   review: [
	 *     { author: { name: "Ana" }, reviewRating: { ratingValue: 5 } },
	 *   ],
	 * });
	 * ```
	 */
	product: Pick<StructuredDataProperties, "aggregateRating"> &
		Partial<Pick<StructuredDataProperties, "review">>;
};

/**
 * The name of a structured data node — the key an app passes to
 * {@link StructuredDataCommands.add}.
 */
export type StructuredDataTarget = keyof StructuredData;

/**
 * Why a {@link StructuredDataCommands.add} call did not take effect.
 *
 * - `invalid_input` — the payload or a value was malformed, e.g. a
 *   `ratingValue` outside `worstRating`..`bestRating`, more than 5 reviews,
 *   or a `review` without an `aggregateRating`. A bug in the app, fixable
 *   in the call itself.
 * - `unknown_target` — the target or one of the properties is not supported
 *   by the platform. Older platforms support fewer, so this is the code to
 *   feature-detect on.
 * - `not_found` — the current page has no such node: it is not a product
 *   page, or the product is not published with structured data.
 * - `refused` — the node already has one of the properties sent, whether
 *   the platform rendered it or an earlier call added it. Values are never
 *   replaced, so nothing on this page will change it.
 * - `bridge_error` — the command never reached the page, or failed on the way
 *   back. Comes with {@link StructuredDataResult.error}.
 */
export type StructuredDataFailureCode =
	| "invalid_input"
	| "unknown_target"
	| "not_found"
	| "refused"
	| "bridge_error";

/**
 * The outcome of a {@link StructuredDataCommands.add} call.
 *
 * `add` never rejects: everything that can go wrong comes back here, so an app
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
	 * Adds properties to a structured data node.
	 *
	 * A property is only ever added, never replaced: if the node already has
	 * it — because the platform rendered it (e.g. from the product's rating
	 * metafields), or another app or an earlier call added it — the call
	 * resolves with `refused` and the page is left as it was. Properties not
	 * sent are left as they are.
	 *
	 * @param target — The node to change, e.g. `"product"`.
	 * @param properties — The properties to add to it.
	 */
	add<K extends StructuredDataTarget>(
		target: K,
		properties: StructuredData[K],
	): Promise<StructuredDataResult>;
};
