import type {
	ThemeColorInterface,
	ThemeColorOpacityRange,
} from "@tiendanube/nube-sdk-types";

export class ThemeColor implements ThemeColorInterface {
	constructor(private readonly token: string) {}

	opacity(opacity: ThemeColorOpacityRange) {
		return `var(--${this.token}-opacity-${opacity.toString().padStart(2, "0")})`;
	}

	toValue(): string {
		return `var(--${this.token})`;
	}

	toString() {
		return this.toValue();
	}
}
