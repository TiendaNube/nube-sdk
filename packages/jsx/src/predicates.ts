/**
 * Predicates for `condition` in `Match.When` and `Show`: pure functions that
 * build the JSON of a condition, which the platform evaluates against the
 * value of a signal.
 *
 * ```tsx
 * import { and, gte, lte } from "@tiendanube/nube-sdk-jsx/predicates";
 *
 * <Match.Value of={score}>
 *   <Match.When condition={and(gte(90), lte(100))}><Excellent /></Match.When>
 * </Match.Value>
 * ```
 *
 * The same functions as `@tiendanube/nube-sdk-ui/predicates`, repeated here so
 * a JSX app imports everything from this package. A separate entry point, so
 * short names such as `and`, `not` or `is` do not reach the main one, where
 * they would clash with names in the app.
 */
export {
	and,
	endsWith,
	gt,
	gte,
	includes,
	is,
	lt,
	lte,
	not,
	oneOf,
	or,
	startsWith,
} from "@tiendanube/nube-sdk-ui/predicates";
