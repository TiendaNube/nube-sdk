import { NubeComponentBoxProps } from "@tiendanube/nube-sdk-types";
import { renderJSX, renderFragment } from "./rendering";
import { NubeComponentColProps } from "@tiendanube/nube-sdk-types";
import { NubeComponentRowProps } from "@tiendanube/nube-sdk-types";
import { NubeComponentFieldProps } from "@tiendanube/nube-sdk-types";
import { NubeComponent } from "@tiendanube/nube-sdk-types";

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace JSX {

  // TODO: Do we want to handle "key" as in react or not? the key property is automatically
  // excluded from props, so we need to handle it separately, and if we don't add it as an optional
  // property, used wont be able to use it in the components.
  interface Key {
    key?: string;
  }

  export interface IntrinsicElements {
    box: NubeComponentBoxProps & Key;
    col: NubeComponentColProps & Key;
    row: NubeComponentRowProps & Key;
    field: NubeComponentFieldProps & Key;
  };

  // Declare the shape of JSX rendering result
  // This is required so the return types of components can be inferred
  export type Element = NubeComponent;
}

// Expose the main namespace
export { JSX };

// Expose factories
export const jsx = renderJSX;
export const jsxs = renderJSX;
export const jsxDEV = renderJSX;
export const Fragment = renderFragment;
