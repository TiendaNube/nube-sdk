import type { NubeComponent } from "../types";
import type { NubeSDKSendableEvent } from "@tiendanube/nube-sdk-types";

export type FieldEventHandler = (data: { type: string; value: string }) => void;

export type FieldProps = {
  name: string;
  label: string;
  onchange?: FieldEventHandler;
  onblur?: FieldEventHandler;
  onfocus?: FieldEventHandler;
};

export const field = (props: FieldProps): NubeComponent => {
  const id = crypto.randomUUID();

  if (props.onchange) {
    const changeEvent: NubeSDKSendableEvent = `custom:field:change:${id}`;
  }

  return {
    type: "field",
    ...props,
    id,
  };
};
