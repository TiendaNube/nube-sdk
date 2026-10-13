export type NubeSDKApp = {
	id: string;
	registered: boolean;
	script: string;
};

export type NubeSDKState = {
	[key: string]: unknown;
};
