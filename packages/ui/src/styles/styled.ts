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
 * It is sticky: it only matches at `lastIndex`.
 */
const KEYFRAMES_AT_RULE = /@(?:-[a-z]+-)?keyframes\b/iy;

function isQuote(char: string | undefined): boolean {
	return char === '"' || char === "'";
}

/**
 * Returns the index just after the CSS string that starts at `start`.
 * A backslash escapes the next character, so `"\""` is one string.
 */
function stringEnd(css: string, start: number): number {
	const quote = css[start];
	let i = start + 1;
	while (i < css.length && css[i] !== quote) {
		i += css[i] === "\\" ? 2 : 1;
	}
	return Math.min(i + 1, css.length);
}

/**
 * Removes the `@keyframes` blocks written by hand in the CSS.
 *
 * Animation names are global on the page, so a hand-written name such as
 * `spin` can replace an animation of the theme or of another app. The
 * `keyframes` helper creates a unique name instead. Its blocks never reach
 * this function: `styled` keeps them apart and puts only the name in the CSS.
 *
 * Text inside CSS strings is skipped, so `content: "@keyframes {"` neither
 * starts a block nor changes where a block ends.
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
	let i = 0;

	while (i < css.length) {
		if (isQuote(css[i])) {
			i = stringEnd(css, i);
			continue;
		}

		atRule.lastIndex = i;
		if (css[i] !== "@" || !atRule.test(css)) {
			i++;
			continue;
		}

		// Find the `{` that opens the body. The name can be a string.
		let open = atRule.lastIndex;
		while (open < css.length && css[open] !== "{") {
			open = isQuote(css[open]) ? stringEnd(css, open) : open + 1;
		}
		// No body: the block is broken, so drop everything from here on.
		removed.push(css.slice(atRule.lastIndex, open).trim());

		let end = open + 1;
		let depth = 1;
		while (end < css.length && depth > 0) {
			const char = css[end];
			if (isQuote(char)) {
				end = stringEnd(css, end);
				continue;
			}
			if (char === "{") depth++;
			else if (char === "}") depth--;
			end++;
		}
		end = Math.min(end, css.length);

		output += css.slice(cursor, i);
		cursor = end;
		i = end;
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
