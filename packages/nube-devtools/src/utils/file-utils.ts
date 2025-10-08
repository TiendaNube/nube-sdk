/**
 * File manipulation utilities for the Nube DevTools extension
 */

/**
 * Copies text to clipboard with fallback for Chrome extension context
 *
 * @param text - Text to copy to clipboard
 * @param onSuccess - Optional success callback
 * @param onError - Optional error callback
 * @returns Promise that resolves when copy is complete
 */
export async function copyToClipboard(
	text: string,
	onSuccess?: (message: string) => void,
	onError?: (error: string) => void
): Promise<void> {
	try {
		// Try Chrome extension method first
		if (typeof chrome !== "undefined" && chrome.runtime) {
			const textArea = document.createElement("textarea");
			textArea.value = text;
			textArea.style.position = "fixed";
			textArea.style.left = "-999999px";
			textArea.style.top = "-999999px";
			document.body.appendChild(textArea);
			textArea.focus();
			textArea.select();

			const successful = document.execCommand("copy");
			document.body.removeChild(textArea);

			if (successful) {
				onSuccess?.("Code copied to clipboard");
				return;
			}
		}

		// Fallback to modern clipboard API
		await navigator.clipboard.writeText(text);
		onSuccess?.("Code copied to clipboard");
	} catch (error) {
		const errorMessage = "Could not copy automatically. Code shown in alert.";
		onError?.(errorMessage);

		// Show alert as last resort
		alert(`Please copy this code manually:\n\n${text}`);
		throw new Error(errorMessage);
	}
}

/**
 * Downloads content as a file
 *
 * @param content - Content to download
 * @param filename - Name of the file to download
 * @param onSuccess - Optional success callback
 */
export function downloadFile(
	content: string,
	filename: string,
	onSuccess?: (message: string) => void
): void {
	const blob = new Blob([content], { type: "text/plain" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);

	onSuccess?.(`${filename} file downloaded`);
}
