import { NubeComponentBoxProps, NubeComponentImg, NubeComponentImgProps, NubeComponentTxtProps } from "@tiendanube/nube-sdk-types";
import { renderJSX, renderFragment } from "./rendering";
import { NubeComponentColProps } from "@tiendanube/nube-sdk-types";
import { NubeComponentRowProps } from "@tiendanube/nube-sdk-types";
import { NubeComponentFieldProps } from "@tiendanube/nube-sdk-types";
import { NubeComponent } from "@tiendanube/nube-sdk-types";

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace JSX {

  export interface IntrinsicElements {
    box: NubeComponentBoxProps;
    col: NubeComponentColProps;
    row: NubeComponentRowProps;
    field: NubeComponentFieldProps;
    img: NubeComponentImgProps;
    txt: NubeComponentTxtProps;
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
