import { NubeComponent } from "@tiendanube/nube-sdk-ui";

export type FunctionComponent = (
  props: Record<string, unknown>
) => NubeComponent;
