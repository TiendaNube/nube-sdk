import type { NubeComponent, NubeComponentProps } from "@tiendanube/nube-sdk-types";

/**
 * Type for functions that create Nube components.
 * This is used to ensure type safety when creating styled components.
 */
type NubeComponentFunction<Props = NubeComponentProps> = (props: Props) => NubeComponent;

/**
 * Minifies an inline CSS string by removing line breaks and unnecessary spaces.
 */
function minify(css: string): string {
  return css
    .replace(/\s*([\{\}:;,])\s*/g, "$1") // remove spaces around { } : ; ,
    .replace(/\s+/g, " ")               // collapse multiple spaces into one
    .replace(/;\}/g, "}")               // remove ; before }
    .replace(/\n/g, "")                 // remove line breaks
    .trim();                            // remove side spaces
}

/**
 * `styled` allows declarative styling with CSS-in-JS.
 * The CSS is inserted directly into the `styled` prop as a string literal.
 */
export function styled<Props extends NubeComponentProps>(
  baseComponent: NubeComponentFunction<Props>
) {
  return (strings: TemplateStringsArray, ...exprs: unknown[]) => {
    const css = String.raw({ raw: strings }, ...exprs);

    const StyledComponent: NubeComponentFunction<Props> = (props) => {
      const component = baseComponent(props)
      if (typeof component === "string") return component;

      component.styled = `${component.styled || ""}${minify(css)}`

      return component;
    };

    return StyledComponent as typeof baseComponent;
  };
}
