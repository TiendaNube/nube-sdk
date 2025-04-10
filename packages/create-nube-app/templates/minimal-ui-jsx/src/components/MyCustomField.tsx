import { Box, Field, Text } from "@tiendanube/nube-sdk-jsx";

export function MyCustomField() {
	return (
		<Box width={100} height={200}>
			<Text>Hello World!</Text>
			<Field
				id="my-custom-field"
				label="Name"
				name="Name"
				onChange={(e) => {
					console.log(`User name: ${e.value}`);
				}}
			/>
		</Box>
	);
}
