import type { NubeComponent } from "@tiendanube/nube-sdk-types";

export type FunctionComponent = (
	props: Record<string, unknown>,
) => NubeComponent;
