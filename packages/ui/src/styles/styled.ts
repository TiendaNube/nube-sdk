import type {
	NubeComponent,
	NubeComponentProps,
} from "@tiendanube/nube-sdk-types";
import { generateInternalId } from "../components/generateInternalId";
import { isKeyframesObject } from "./keyframes";
import { minify } from "./minify";

/**
 * Type for functions that create Nube components.
 * This is used to ensure type safety when creating styled components.
 */
type NubeComponentFunction<Props = NubeComponentProps> = (
	props: Props,
) => NubeComponent;

/**
 * Matches the start of a `@keyframes` at-rule, with or without a vendor
 * prefix (`@-webkit-keyframes`). At-rule names are case-insensitive in CSS.
 */
const KEYFRAMES_AT_RULE = /@(?:-[a-z]+-)?keyframes\b/gi;

/**
 * Removes the `@keyframes` blocks written by hand in the CSS.
 *
 * Animation names are global on the page, so a hand-written name such as
 * `spin` can replace an animation of the theme or of another app. The
 * `keyframes` helper creates a unique name instead. Its blocks never reach
 * this function: `styled` keeps them apart and puts only the name in the CSS.
 *
 * Returns the CSS without those blocks and the names that were removed.
 */
function removeHandWrittenKeyframes(css: string): {
	css: string;
	removed: string[];
} {
	const atRule = new RegExp(KEYFRAMES_AT_RULE.source, KEYFRAMES_AT_RULE.flags);
	const removed: string[] = [];
	let output = "";
	let cursor = 0;

	for (;;) {
		const match = atRule.exec(css);
		if (!match) break;

		const open = css.indexOf("{", atRule.lastIndex);
		// No body: the block is broken, so drop everything from here on.
		const nameEnd = open === -1 ? css.length : open;
		removed.push(css.slice(atRule.lastIndex, nameEnd).trim());

		let end = css.length;
		if (open !== -1) {
			let depth = 1;
			end = open + 1;
			while (end < css.length && depth > 0) {
				if (css[end] === "{") depth++;
				else if (css[end] === "}") depth--;
				end++;
			}
		}

		output += css.slice(cursor, match.index);
		cursor = end;
		atRule.lastIndex = end;
	}

	output += css.slice(cursor);
	return { css: output, removed };
}

function warnHandWrittenKeyframes(names: string[]): void {
	const list = names.map((name) => `"${name || "(no name)"}"`).join(", ");
	console.warn(
		`[nube-sdk-ui] styled: removed hand-written @keyframes ${list}. Animation names are global and can replace an animation of the store or of another app. Use the keyframes helper instead, which creates a unique name: const spin = keyframes\`to { transform: rotate(360deg); }\`; then animation: \${spin} 1s linear infinite;`,
	);
}

/**
 * `styled` allows declarative styling with CSS-in-JS.
 * The CSS is inserted directly into the `styled` prop as a string literal.
 */
export function styled<Props extends NubeComponentProps>(
	baseComponent: NubeComponentFunction<Props>,
) {
	return (strings: TemplateStringsArray, ...exprs: unknown[]) => {
		// Warn once per styled component, not on every render.
		let warned = false;

		const StyledComponent: NubeComponentFunction<Props> = (props) => {
			let rawCSS = "";
			const animation: string[] = [];

			for (let i = 0; i < strings.length; i++) {
				const currentString = strings[i] ?? "";
				const expr = exprs[i];

				if (isKeyframesObject(expr)) {
					animation.push(expr.css);
					rawCSS += `${currentString}${expr.name} `;
				} else {
					const value = expr === null || expr === undefined ? "" : String(expr);
					rawCSS += `${currentString}${value}`;
				}
			}

			// Blocks from the keyframes helper are in `animation`, not in
			// `rawCSS`, so only hand-written blocks are removed here. Comments
			// are removed first, so a `@keyframes` inside one is ignored.
			const { css: ownCSS, removed } = removeHandWrittenKeyframes(
				minify(rawCSS),
			);

			if (removed.length > 0 && !warned) {
				warned = true;
				warnHandWrittenKeyframes(removed);
			}

			const minifiedCSS = minify(`${animation.join("")}${ownCSS}`);

			const componentType = baseComponent.name || "component";

			const internalId = generateInternalId(componentType, {
				...props,
				__styledCSS: minifiedCSS,
			});

			// Create the base component with pre-generated ID
			const component = baseComponent({ ...props, __internalId: internalId });

			if (typeof component === "string") return component;

			// Apply the styled CSS
			component.styled = `${component.styled || ""}${minifiedCSS}`;

			return component;
		};

		return StyledComponent as typeof baseComponent;
	};
}
