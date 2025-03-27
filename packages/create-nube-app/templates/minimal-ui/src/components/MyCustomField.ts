import { box, field } from "@tiendanube/nube-sdk-ui";

export function MyCustomField() {
	return box({
		width: 100,
		height: 200,
		children: [
			field({
				id: "my-custom-field",
				label: "Name",
				name: "Name",
				onChange: (e) => {
					console.log(`User name: ${e.value}`);
				},
			}),
		],
	});
}
