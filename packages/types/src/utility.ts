export type Prettify<T> = {
	[K in keyof T]: T[K];
} & {};

export type Nullable<T> = T | null;

export type DeepNullable<T> = {
	[K in keyof T]: T[K] extends object
		? Nullable<DeepNullable<T[K]>>
		: Nullable<T[K]>;
};

export type DeepPartial<T> = {
	[K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};
