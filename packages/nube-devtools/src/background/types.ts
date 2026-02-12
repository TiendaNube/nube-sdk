export type NubeSDKApp = {
	id: string;
	registered: boolean;
	script: string;
	errors?: string[];
};

export type NubeSDKComponent = {
	type: string;
	children?: Array<NubeSDKComponent> | NubeSDKComponent;
	__internalId?: string;
	props: Record<string, unknown>;
};

export type NubeSDKState = {
	[key: string]: unknown;
};
