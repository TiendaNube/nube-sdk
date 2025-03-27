import type { NubeSDK } from "@tiendanube/nube-sdk-types";
import { MyCustomField } from "./components/MyCustomField";

export function App(nube: NubeSDK) {
	nube.send("ui:slot:set", () => ({
		ui: {
			slots: {
				after_line_items: <MyCustomField />,
			},
		},
	}));
}
