import { box, col, row, field, FieldProps, RowProps, ColProps, BoxProps } from "@tiendanube/nube-sdk-ui";
import { JSX } from "./jsx-runtime";
import { FunctionComponent } from "./types";

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
      return box(props as BoxProps);
    case "col":
      return col(props as ColProps);
    case "row":
      return row(props as RowProps);
    case "field":
      return field(props as FieldProps);
  }

  return box({});
}