import type { NubeSDK } from "@tiendanube/nube-sdk-types";

const testSimple = 
	<box key="fede" width={100} height={200}>
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

console.log("TestBox", <TestBox/>);

function TestBoxNested() {
	return <box width={100} height={200}>
			<TestBox/>
			<row width={10}/>
			<col height={20}/>
		</box>
}

console.log("TestBoxNested", <TestBoxNested/>);

console.log("Fragment", <></>);

console.log("TestBoxNested inside Fragment", <>
		<TestBoxNested/>
	</>);

console.log("Field", 
	<field 
		name="Something" 
		label="Label" 
		onchange={(e) => console.log(e)}
		onblur={(e) => console.log(e)}
		onfocus={(e) => console.log(e)}
	/>
);

const compA = <TestBox/>;
const compB = <TestBox/>;

console.log("Combined instances", <>{[compA, compB]}</>);

export function App(nube: NubeSDK) {
	nube.on("cart:update", ({ cart }) => {
		console.log(cart);
	});
}