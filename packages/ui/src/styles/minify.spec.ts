import { describe, expect, it } from "vitest";
import { minify } from "./minify";

describe("minify", () => {
	it("should remove unnecessary spaces around CSS syntax characters", () => {
		const css = "body { color : red ; }";
		const result = minify(css);
		expect(result).toBe("body{color:red}");
	});

	it("should collapse multiple spaces into one", () => {
		const css = "body    {    color:    red;    }";
		const result = minify(css);
		expect(result).toBe("body{color:red}");
	});

	it("should remove semicolons before closing braces", () => {
		const css = "body{color:red;}";
		const result = minify(css);
		expect(result).toBe("body{color:red}");
	});

	it("should remove line breaks", () => {
		const css = `body {
			color: red;
		}`;
		const result = minify(css);
		expect(result).toBe("body{color:red}");
	});

	it("should remove leading and trailing spaces", () => {
		const css = "   body{color:red}   ";
		const result = minify(css);
		expect(result).toBe("body{color:red}");
	});

	it("should handle complex CSS with multiple rules", () => {
		const css = `
			body {
				margin: 0;
				padding: 0;
			}
			.container {
				display: flex;
				justify-content: center;
			}
		`;
		const result = minify(css);
		expect(result).toBe(
			"body{margin:0;padding:0}.container{display:flex;justify-content:center}",
		);
	});

	it("should handle CSS with comments", () => {
		const css = `
			/* This is a comment */
			body {
				color: red; /* inline comment */
			}
		`;
		const result = minify(css);
		expect(result).toBe("body{color:red}");
	});

	it("should handle empty CSS", () => {
		const css = "";
		const result = minify(css);
		expect(result).toBe("");
	});

	it("should handle CSS with only whitespace", () => {
		const css = "   \n\t   ";
		const result = minify(css);
		expect(result).toBe("");
	});

	it("should handle CSS with media queries", () => {
		const css = `
			@media (max-width: 768px) {
				.container {
					flex-direction: column;
				}
			}
		`;
		const result = minify(css);
		expect(result).toBe(
			"@media (max-width:768px){.container{flex-direction:column}}",
		);
	});

	it("should handle CSS with pseudo-selectors", () => {
		const css = `
			button:hover {
				background-color: blue;
			}
			button:active {
				background-color: darkblue;
			}
		`;
		const result = minify(css);
		expect(result).toBe(
			"button:hover{background-color:blue}button:active{background-color:darkblue}",
		);
	});

	it("should handle CSS with nested selectors", () => {
		const css = `
			.parent .child {
				color: green;
			}
			.parent > .direct-child {
				color: yellow;
			}
		`;
		const result = minify(css);
		expect(result).toBe(
			".parent .child{color:green}.parent > .direct-child{color:yellow}",
		);
	});

	it("should handle CSS with multiple values", () => {
		const css = `
			.element {
				margin: 10px 20px 30px 40px;
				padding: 5px 10px;
				border: 1px solid black;
			}
		`;
		const result = minify(css);
		expect(result).toBe(
			".element{margin:10px 20px 30px 40px;padding:5px 10px;border:1px solid black}",
		);
	});

	it("should handle CSS with URLs", () => {
		const css = `
			.background {
				background-image: url('https://example.com/image.jpg');
			}
		`;
		const result = minify(css);
		expect(result).toBe(
			".background{background-image:url('https://example.com/image.jpg')}",
		);
	});

	it("should handle CSS with calc() functions", () => {
		const css = `
			.calculated {
				width: calc(100% - 20px);
				height: calc(50vh + 10px);
			}
		`;
		const result = minify(css);
		expect(result).toBe(
			".calculated{width:calc(100% - 20px);height:calc(50vh + 10px)}",
		);
	});

	it("should handle CSS with rgba() colors", () => {
		const css = `
			.transparent {
				background-color: rgba(255, 0, 0, 0.5);
				color: rgba(0, 255, 0, 0.8);
			}
		`;
		const result = minify(css);
		expect(result).toBe(
			".transparent{background-color:rgba(255,0,0,0.5);color:rgba(0,255,0,0.8)}",
		);
	});
});
