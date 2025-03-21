import type { NubeSDK } from "@tiendanube/nube-sdk-types";
import { box, field } from "@tiendanube/nube-sdk-ui";

export function App(nube: NubeSDK) {
  nube.on("cart:update", ({ cart }) => {
    console.log(cart);
  });

  nube.send("ui:slot:set", () => ({
    ui: {
      slots: {
        after_line_items:
          box({
            width: 100, height: 200, children: [
              field({
                id: "myField",
                label: "Name",
                name: "Name",
                onChange: (e) => {
                  console.log("User name: " + e.value)
                }
              })
            ]
          })
      }
    }
  }));
}
