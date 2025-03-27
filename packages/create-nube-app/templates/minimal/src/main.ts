import type { NubeSDK } from "@tiendanube/nube-sdk-types";

export function App(nube: NubeSDK) {
	nube.on("cart:update", ({ cart }) => {
		console.log(cart, "cart");
	});
}
