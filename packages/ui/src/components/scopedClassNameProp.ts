import type { ClassNameProps } from "@tiendanube/nube-sdk-types";

/**
 * Prefixes each class in `className` with the app id (`app-{appId}_{class}`),
 * scoping it to the app. Classes that already carry the prefix are kept as is.
 * Returns an object ready to be spread into the props, or an empty object when
 * `className` is undefined.
 */
export function scopedClassNameProp(className?: string): ClassNameProps {
	if (className === undefined) return {};
	const prefix = `app-${self.__APP_DATA__.id}_`;
	return {
		className: className
			.split(/\s+/)
			.filter(Boolean)
			.map((name) => (name.startsWith(prefix) ? name : `${prefix}${name}`))
			.join(" "),
	};
}
