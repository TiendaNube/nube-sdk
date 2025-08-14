export function safe(fn: () => void, message: string): void {
	try {
		fn();
	} catch (error) {
		console.error(message, error);
	}
}
