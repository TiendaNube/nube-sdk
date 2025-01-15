import type { NubeSDK } from "@tiendanube/nube-sdk-types";
import { field, box, row, col } from "@tiendanube/nube-sdk-ui";

console.log(
<field id="myField" label="myLabel" name="nameless">
	Hello World
	<box width={100} height={200}/>
	<box width={100} height={200}/>
	Another World
</field>)

field({ 
	id: "myField",
	name: "field", 
	label: "User Name", 
	onChange: (e) => console.log(e.value) }
);

const myField2 = <field name = "Something 2" label = "My Label" onChange={(e) => console.log(e)} />;

const myBox = col({ 
	width: 100, 
	height: 200,
	margin: 10,
	justifyContent: "space-around",
	children: [],
});

const myField = <field
	name="Something"
	label="Label"
	onChange={(e) => console.log(e)}
	onBlur={(e) => console.log(e)}
	onFocus={(e) => console.log(e)}
/>

console.log("Field",
	myField
);

const testSimple =
	<box key="myBox" width={100} height={200}>
		hello world
	</box>;
console.log("Simple box", testSimple);

const testNested =
	<box width={100} height={200} >
		<box width={50} height={50} />
	</box>;
console.log("Simple nested boxes", testNested);

function TestBox() {
	return <box width={100} height={200} />
}

console.log("TestBox", <TestBox />);

function TestBoxNested() {
	return <box width={100} height={200}>
		<TestBox />
		<row width={10} />
		<col height={20} />
	</box>
}

console.log("TestBoxNested", <TestBoxNested />);

console.log("Fragment", <></>);

console.log("TestBoxNested inside Fragment", <>
	<TestBoxNested />
</>);

const compA = <TestBox />;
const compB = <TestBox />;

console.log("Combined instances", <>{[compA, compB]}</>);

export function App(nube: NubeSDK) {
	nube.on("cart:update", ({ cart }) => {
		console.log(cart);
	});

	nube.send("ui:slot:set", () => ({
		ui: {
			slots: {
				after_line_items:
					<box width={100} height={200}>
						<field
							id="myField"
							label="myLabel"
							name="nameless"
							onChange={(e) => {
								console.log(e.value)
							}}
						/>
					</box>
			}
		}

	}));
}
