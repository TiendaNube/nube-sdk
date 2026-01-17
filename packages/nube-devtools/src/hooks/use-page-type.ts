import { useCallback, useEffect, useState } from "react";

type PageType = "checkout" | "storefront";

export function usePageType(): PageType | null {
	const [pageType, setPageType] = useState<PageType | null>(null);

	const fetchPageType = useCallback(() => {
		chrome.devtools.inspectedWindow.eval(
			"window.location.pathname",
			(result, isException) => {
				if (isException || !result) {
					return;
				}

				const pathname = result as string;
				if (pathname) {
					const isCheckout = pathname.includes("/checkout/");
					setPageType(isCheckout ? "checkout" : "storefront");
				}
			},
		);
	}, []);

	useEffect(() => {
		fetchPageType();

		const interval = setInterval(() => {
			fetchPageType();
		}, 1000);

		return () => {
			clearInterval(interval);
		};
	}, [fetchPageType]);

	return pageType;
}
