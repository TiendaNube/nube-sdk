import { Box, Field, Txt } from "@tiendanube/nube-sdk-jsx";

export function MyCustomField() {
	return (
		<Box width={100} height={200}>
			<Txt>Hello!!</Txt>
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
