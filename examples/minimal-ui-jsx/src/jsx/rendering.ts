import { box, col, row, field } from "@tiendanube/nube-sdk-ui";
import { JSX } from "./jsx-runtime";
import { FunctionComponent } from "./types";
import { NubeComponentBoxProps, NubeComponentColProps, NubeComponentFieldProps, NubeComponentRowProps } from "@tiendanube/nube-sdk-types";

export function renderJSX<K extends keyof JSX.IntrinsicElements>(
  tag: K | FunctionComponent | undefined,
  props: Record<string, unknown>,
  _key?: string
): JSX.Element {

  // TODO: Do we want to handle "key" as in react or not? the key property is automatically
  // excluded from props, so we need to handle it separately
  /*if (_key) {
    console.log("renderJSX key: " + _key);
    console.log("renderJSX props: ", props);
  }*/

  // Fragment
  if (tag == undefined) {
    // TODO: We need a specific container for fragments...
    return renderTag("box", (props as unknown) as JSX.IntrinsicElements[K]);
  }

  // Function
  if (typeof tag == "function") {
    return tag(props);
  }

  // Normal tag
  return renderTag<K>(tag, (props as unknown) as JSX.IntrinsicElements[K]);
}

export function renderFragment(
  props: any,
): JSX.Element {
  return renderJSX(undefined, props);
}

function renderTag<K extends keyof JSX.IntrinsicElements>(tag: K, props: JSX.IntrinsicElements[K]): JSX.Element {
  switch (tag) {
    case "box":
      return box(props as NubeComponentBoxProps);
    case "col":
      return col(props as NubeComponentColProps);
    case "row":
      return row(props as NubeComponentRowProps);
    case "field":
      return field(props as NubeComponentFieldProps);
  }

  return box({});
}
