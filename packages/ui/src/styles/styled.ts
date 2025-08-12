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
 * `styled` allows declarative styling with CSS-in-JS.
 * The CSS is inserted directly into the `styled` prop as a string literal.
 */
export function styled<Props extends NubeComponentProps>(
	baseComponent: NubeComponentFunction<Props>,
) {
	return (strings: TemplateStringsArray, ...exprs: unknown[]) => {
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

			const minifiedCSS = minify(`${animation.join("")}${rawCSS}`);

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
