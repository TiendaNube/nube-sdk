import type { NubeSDK } from "@tiendanube/nube-sdk-types";
import { Box, Field, Txt } from "@tiendanube/nube-sdk-jsx";

function MyComponent() {
  return (
    <Box width={100} height={200}>
      <Txt>Hello!!</Txt>
      <Field
        id="myField"
        label="Name"
        name="Name"
        onChange={(e) => {
          console.log(`User name: ${e.value}`);
        }}
      />
    </Box>
  );
}

export function App(nube: NubeSDK) {
  nube.send("ui:slot:set", () => ({
    ui: {
      slots: {
        after_line_items: <MyComponent />,
      },
    },
  }));
}
