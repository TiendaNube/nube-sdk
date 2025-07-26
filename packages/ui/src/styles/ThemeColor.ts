export type ThemeColorOpacityRange =
	| 0
	| 5
	| 10
	| 20
	| 30
	| 40
	| 50
	| 60
	| 70
	| 80
	| 90;

export class ThemeColor {
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
