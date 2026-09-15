import { describe, expect, it } from "vitest";
import { checkbox } from "./checkbox";
import { formCheckbox } from "./form-checkbox";

describe("checkbox", () => {
	it("forwards disabled to the component node", () => {
		const node = checkbox({
			name: "terms",
			label: "I agree",
			checked: false,
			disabled: true,
		});

		expect(node.type).toBe("check");
		expect(node.disabled).toBe(true);
	});

	it("leaves disabled undefined when it is not passed", () => {
		const node = checkbox({ name: "terms", label: "I agree", checked: false });

		expect(node.disabled).toBeUndefined();
	});

	it("accepts the same disabled shape as formCheckbox", () => {
		// formCheckbox is documented as mirroring the public checkbox props, so
		// the two have to agree on this one. They did not before: checkbox was
		// the only input component without `disabled`.
		const plain = checkbox({
			name: "opt",
			label: "Optional item",
			checked: false,
			disabled: true,
		});
		const inForm = formCheckbox({
			name: "opt",
			label: "Optional item",
			checked: false,
			disabled: true,
		});

		expect(plain.disabled).toBe(inForm.disabled);
	});

	it("keeps disabled independent from checked", () => {
		// A disabled checkbox can be checked or unchecked: quota pickers render
		// the already selected items as checked and disabled at the same time.
		const checkedAndDisabled = checkbox({
			name: "kit-a",
			label: "Kit A",
			checked: true,
			disabled: true,
		});

		expect(checkedAndDisabled.checked).toBe(true);
		expect(checkedAndDisabled.disabled).toBe(true);
	});
});
