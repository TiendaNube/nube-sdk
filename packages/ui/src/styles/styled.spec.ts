import { describe, it, expect } from "vitest";
import { styled } from "./styled";
import { box } from "../components/box";
import { text } from "../components/text";
import { button } from "../components/button";
import type { NubeComponentText, NubeComponentWithStyle } from "@tiendanube/nube-sdk-types";

describe("styled", () => {
  describe("basic functionality", () => {
    it("should create a styled component with basic CSS", () => {
      const StyledBox = styled(box)`
				background-color: red;
				padding: 16px;
			`;

      const result = StyledBox({ children: "Test content" });

      expect(result).toEqual({
        type: "box",
        children: "Test content",
        styled: "background-color:red;padding:16px;",
      });
    });

    it("should preserve all original props when styling", () => {
      const StyledBox = styled(box)`
				background-color: blue;
			`;

      const result = StyledBox({
        children: "Content",
        width: "100%",
        height: "200px",
        padding: "16px",
        id: "test-box",
      });

      expect(result).toEqual({
        type: "box",
        children: "Content",
        width: "100%",
        height: "200px",
        padding: "16px",
        id: "test-box",
        styled: "background-color:blue;",
      });
    });

    it("should work with text components", () => {
      const StyledText = styled(text)`
				color: white;
				font-size: 18px;
				font-weight: bold;
			`;

      const result = StyledText({ children: "Hello World" });

      expect(result).toEqual({
        type: "txt",
        children: "Hello World",
        styled: "color:white;font-size:18px;font-weight:bold;",
      });
    });

    it("should work with button components", () => {
      const StyledButton = styled(button)`
				background-color: green;
				border-radius: 8px;
				padding: 12px 24px;
			`;

      const result = StyledButton({ children: "Click me" });

      expect(result).toEqual({
        type: "button",
        children: "Click me",
        styled: "background-color:green;border-radius:8px;padding:12px 24px;",
      });
    });
  });

  describe("template literal interpolation", () => {
    it("should handle CSS variables", () => {
      const color = "var(--primary-color)";
      const StyledBox = styled(box)`
				background-color: ${color};
				padding: 16px;
			`;

      const result = StyledBox({ children: "Content" });

      expect(result).toEqual({
        type: "box",
        children: "Content",
        styled: "background-color:var(--primary-color);padding:16px;",
      });
    });

    it("should handle dynamic values", () => {
      const getPadding = () => "20px";
      const StyledBox = styled(box)`
				padding: ${getPadding()};
				margin: 10px;
			`;

      const result = StyledBox({ children: "Content" });

      expect(result).toEqual({
        type: "box",
        children: "Content",
        styled: "padding:20px;margin:10px;",
      });
    });

    it("should handle multiple interpolations", () => {
      const bgColor = "red";
      const textColor = "white";
      const StyledBox = styled(box)`
				background-color: ${bgColor};
				color: ${textColor};
				padding: 16px;
			`;

      const result = StyledBox({ children: "Content" });

      expect(result).toEqual({
        type: "box",
        children: "Content",
        styled: "background-color:red;color:white;padding:16px;",
      });
    });

    it("should handle empty interpolations", () => {
      const StyledBox = styled(box)`
				background-color: red;
				${""}
				padding: 16px;
			`;

      const result = StyledBox({ children: "Content" });

      expect(result).toEqual({
        type: "box",
        children: "Content",
        styled: "background-color:red;padding:16px;",
      });
    });
  });

  describe("CSS formatting", () => {
    it("should preserve CSS formatting and indentation", () => {
      const StyledBox = styled(box)`
				background-color: red;
				padding: 16px;
				margin: 8px;

				:hover {
					background-color: darkred;
				}
			`;

      const result = StyledBox({ children: "Content" });

      expect((result as NubeComponentWithStyle).styled).toContain("background-color:red");
      expect((result as NubeComponentWithStyle).styled).toContain("padding:16px");
      expect((result as NubeComponentWithStyle).styled).toContain("margin:8px");
      expect((result as NubeComponentWithStyle).styled).toContain(":hover{background-color:darkred}");
    });

    it("should handle single line CSS", () => {
      const StyledBox = styled(box)`background-color: red; padding: 16px;`;

      const result = StyledBox({ children: "Content" });

      expect((result as NubeComponentWithStyle).styled).toBe("background-color:red;padding:16px;");
    });

    it("should handle CSS with comments", () => {
      const StyledBox = styled(box)`
				/* Main styles */
				background-color: red;
				padding: 16px;

				/* Hover effect */
				:hover {
					background-color: darkred;
				}
			`;

      const result = StyledBox({ children: "Content" });

      expect((result as NubeComponentWithStyle).styled).toContain("/* Main styles */");
      expect((result as NubeComponentWithStyle).styled).toContain("/* Hover effect */");
      expect((result as NubeComponentWithStyle).styled).toContain("background-color:red");
    });
  });

  describe("component composition", () => {
    it("should allow chaining styled components", () => {
      const BaseStyledBox = styled(box)`
				background-color: red;
				padding: 16px;
			`;

      const FinalStyledBox = styled(BaseStyledBox)`
				border: 2px solid black;
				margin: 8px;
			`;

      const result = FinalStyledBox({ children: "Content" });

      expect(result).toEqual({
        type: "box",
        children: "Content",
        styled: "background-color:red;padding:16px;border:2px solid black;margin:8px;",
      });
    });

    it("should work with different component types", () => {
      const StyledText = styled(text)`
				color: white;
				font-size: 16px;
			`;

      const StyledBox = styled(box)`
				background-color: blue;
				padding: 16px;
			`;

      const textResult = StyledText({ children: "Text content" }) as NubeComponentWithStyle;
      const boxResult = StyledBox({ children: "Box content" }) as NubeComponentWithStyle;

      if (typeof textResult === "object" && textResult !== null) {
        expect(textResult.type).toBe("txt");
      }
      if (typeof boxResult === "object" && boxResult !== null) {
        expect(boxResult.type).toBe("box");
      }
      expect(textResult.styled).toContain("color:white");
      expect(boxResult.styled).toContain("background-color:blue");
    });
  });

  describe("edge cases", () => {
    it("should handle empty CSS template", () => {
      const StyledBox = styled(box)``;

      const result = StyledBox({ children: "Content" });

      expect(result).toEqual({
        type: "box",
        children: "Content",
        styled: "",
      });
    });

    it("should handle CSS with only whitespace", () => {
      const StyledBox = styled(box)`

			`;

      const result = StyledBox({ children: "Content" });

      expect((result as NubeComponentWithStyle).styled).toBe("");
    });

    it("should handle components with no props", () => {
      const StyledBox = styled(box)`
				background-color: red;
			`;

      const result = StyledBox({});

      expect(result).toEqual({
        type: "box",
        styled: "background-color:red;",
      });
    });

    it("should handle null and undefined interpolations", () => {
      const StyledBox = styled(box)`
				background-color: ${null};
				color: ${undefined};
				padding: 16px;
			`;

      const result = StyledBox({ children: "Content" }) as NubeComponentWithStyle;

      expect(result.styled).toContain("background-color:null");
      expect(result.styled).toContain("color:undefined");
      expect(result.styled).toContain("padding:16px");
    });

    it("should handle object interpolations", () => {
      const styleObject = { backgroundColor: "red" };
      const StyledBox = styled(box)`
				background-color: ${styleObject};
				padding: 16px;
			`;

      const result = StyledBox({ children: "Content" }) as NubeComponentWithStyle;

      expect(result.styled).toContain("[object Object]");
      expect(result.styled).toContain("padding:16px");
    });
  });

  describe("type safety", () => {
    it("should maintain component type information", () => {
      const StyledBox = styled(box)`
				background-color: red;
			`;

      // This should compile without type errors
      const result = StyledBox({ children: "Content" }) as NubeComponentWithStyle;

      if (typeof result === "object" && result !== null) {
        expect(result.type).toBe("box");
      }
    });

    it("should preserve component props interface", () => {
      const StyledText = styled(text)`
				color: white;
			`;

      // This should compile without type errors
      const result = StyledText({
        children: "Text",
        color: "red", // Should still accept original props
        heading: 1,
      }) as NubeComponentText & NubeComponentWithStyle;

      expect(result.type).toBe("txt");
      expect(result.color).toBe("red");
      expect(result.heading).toBe(1);
    });
  });

  describe("real-world scenarios", () => {
    it("should handle complex CSS with media queries", () => {
      const StyledBox = styled(box)`
				background-color: red;
				padding: 16px;

				@media (max-width: 768px) {
					padding: 8px;
					background-color: blue;
				}

				@media (min-width: 1024px) {
					padding: 24px;
					background-color: green;
				}
			`;

      const result = StyledBox({ children: "Responsive content" }) as NubeComponentWithStyle;
      expect(result.styled).toContain("@media (max-width:768px)");
      expect(result.styled).toContain("@media (min-width:1024px)");
      expect(result.styled).toContain("background-color:red");
    });

    it("should handle CSS with pseudo-selectors", () => {
      const StyledButton = styled(button)`
				background-color: blue;
				color: white;
				padding: 12px 24px;
				border: none;
				border-radius: 4px;

				:hover {
					background-color: darkblue;
				}

				:active {
					background-color: navy;
				}

				:disabled {
					background-color: gray;
					cursor: not-allowed;
				}
			`;

      const result = StyledButton({ children: "Click me" }) as NubeComponentWithStyle;

      expect(result.styled).toContain(":hover{background-color:darkblue}");
      expect(result.styled).toContain(":active{background-color:navy}");
      expect(result.styled).toContain(":disabled{background-color:gray;cursor:not-allowed}");
      expect(result.styled).toContain("background-color:blue");
    });

    it("should handle CSS with custom properties", () => {
      const StyledBox = styled(box)`
				--custom-color: #ff6b6b;
				--custom-padding: 20px;

				background-color: var(--custom-color);
				padding: var(--custom-padding);
				border-radius: 8px;
				box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
			`;

      const result = StyledBox({ children: "Custom styled content" }) as NubeComponentWithStyle;

      expect(result.styled).toContain("--custom-color:#ff6b6b");
      expect(result.styled).toContain("--custom-padding:20px");
      expect(result.styled).toContain("background-color:var(--custom-color)");
      expect(result.styled).toContain("padding:var(--custom-padding)");
    });
  });

  describe("CSS minification", () => {
    it("should minify CSS by removing unnecessary spaces", () => {
      const StyledBox = styled(box)`
				background-color : red ;
				padding : 16px ;
				margin : 8px ;
			`;

      const result = StyledBox({ children: "Content" }) as NubeComponentWithStyle;

      expect(result.styled).toBe("background-color:red;padding:16px;margin:8px;");
    });

    it("should minify CSS by removing line breaks", () => {
      const StyledBox = styled(box)`
				background-color: red;
				padding: 16px;
				margin: 8px;
			`;

      const result = StyledBox({ children: "Content" }) as NubeComponentWithStyle;

      expect(result.styled).toBe("background-color:red;padding:16px;margin:8px;");
    });

    it("should minify CSS by removing semicolon before closing brace", () => {
      const StyledBox = styled(box)`
				background-color: red;
				padding: 16px;
			`;

      const result = StyledBox({ children: "Content" }) as NubeComponentWithStyle;

      expect(result.styled).toBe("background-color:red;padding:16px;");
    });

    it("should minify CSS with complex selectors", () => {
      const StyledBox = styled(box)`
				background-color: red;
				padding: 16px;

				:hover {
					background-color: darkred;
					transform: scale(1.1);
				}

				:active {
					background-color: navy;
					transform: scale(0.95);
				}
			`;

      const result = StyledBox({ children: "Content" }) as NubeComponentWithStyle;

      expect(result.styled).toContain("background-color:red");
      expect(result.styled).toContain(":hover{background-color:darkred;transform:scale(1.1)}");
      expect(result.styled).toContain(":active{background-color:navy;transform:scale(0.95)}");
    });

    it("should preserve CSS comments", () => {
      const StyledBox = styled(box)`
				/* This is a comment */
				background-color: red;
				/* Another comment */
				padding: 16px;
			`;

      const result = StyledBox({ children: "Content" }) as NubeComponentWithStyle;

      expect(result.styled).toContain("/* This is a comment */");
      expect(result.styled).toContain("/* Another comment */");
      expect(result.styled).toContain("background-color:red");
      expect(result.styled).toContain("padding:16px");
    });

    it("should handle CSS with multiple spaces and tabs", () => {
      const StyledBox = styled(box)`
				background-color:     red;
				padding:    16px;
				margin:  8px;
			`;

      const result = StyledBox({ children: "Content" }) as NubeComponentWithStyle;

      expect(result.styled).toBe("background-color:red;padding:16px;margin:8px;");
    });
  });
});
