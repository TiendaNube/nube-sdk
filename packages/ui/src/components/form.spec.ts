import { describe, expect, it } from "vitest";
import { formCheckbox } from "./form-checkbox";
import { formFailure } from "./form-failure";
import { formField } from "./form-field";
import { formFieldError } from "./form-field-error";
import { formRadio } from "./form-radio";
import { formResetter } from "./form-resetter";
import { formRoot } from "./form-root";
import { formSelect } from "./form-select";
import { formSending } from "./form-sending";
import { formSubmitter } from "./form-submitter";
import { formSuccess } from "./form-success";

describe("formRoot", () => {
	it("creates a formRoot with the type tag and a stable internal id", () => {
		const node = formRoot({ target: "/api/x", method: "POST" });

		expect(node.type).toBe("formRoot");
		expect(node.target).toBe("/api/x");
		expect(node.method).toBe("POST");
		expect(node.__internalId).toMatch(/^formRoot-test-app-id-[a-z0-9]+$/);
	});

	it("forwards children and submit callbacks", () => {
		const onSuccess = () => undefined;
		const onFail = () => undefined;
		const child = formSubmitter({ children: "Send" });

		const node = formRoot({
			target: "/api/x",
			onSuccess,
			onFail,
			children: child,
		});

		expect(node.onSuccess).toBe(onSuccess);
		expect(node.onFail).toBe(onFail);
		expect(node.children).toBe(child);
	});

	it("preserves a valid __internalId passed by the caller", () => {
		const reusableId = "formRoot-test-app-id-abc123";
		const node = formRoot({
			__internalId: reusableId,
			target: "/api/x",
		});

		expect(node.__internalId).toBe(reusableId);
	});
});

describe("formField", () => {
	it("creates a formField with native validation attributes preserved", () => {
		const node = formField({
			inputType: "text",
			name: "owner",
			label: "Owner",
			required: true,
			minLength: 3,
			maxLength: 20,
			pattern: "[a-z]+",
		});

		expect(node.type).toBe("formField");
		expect(node.inputType).toBe("text");
		expect(node.name).toBe("owner");
		expect(node.label).toBe("Owner");
		expect(node.required).toBe(true);
		expect(node.minLength).toBe(3);
		expect(node.maxLength).toBe(20);
		expect(node.pattern).toBe("[a-z]+");
		expect(node.__internalId).toMatch(/^formField-test-app-id-[a-z0-9]+$/);
	});

	it("supports file-specific props (accept, maxSize)", () => {
		const MAX_SIZE = 5 * 1024 * 1024;
		const node = formField({
			inputType: "file",
			name: "document",
			label: "Document",
			accept: ".pdf",
			maxSize: MAX_SIZE,
		});

		expect(node.inputType).toBe("file");
		expect(node.accept).toBe(".pdf");
		expect(node.maxSize).toBe(MAX_SIZE);
	});

	it("produces different ids for fields with different inputType", () => {
		const text = formField({
			inputType: "text",
			name: "owner",
			label: "Owner",
		});
		const email = formField({
			inputType: "email",
			name: "owner",
			label: "Owner",
		});

		expect(text.__internalId).not.toBe(email.__internalId);
	});
});

describe("formFieldError", () => {
	it("creates a formFieldError with the match and children", () => {
		const node = formFieldError({
			match: "valueMissing",
			children: "Name is required",
		});

		expect(node.type).toBe("formFieldError");
		expect(node.match).toBe("valueMissing");
		expect(node.children).toBe("Name is required");
		expect(node.__internalId).toMatch(/^formFieldError-test-app-id-[a-z0-9]+$/);
	});

	it("produces different ids for different match values", () => {
		const missing = formFieldError({
			match: "valueMissing",
			children: "Required",
		});
		const tooShort = formFieldError({
			match: "tooShort",
			children: "Too short",
		});

		expect(missing.__internalId).not.toBe(tooShort.__internalId);
	});
});

describe("formSelect", () => {
	it("creates a formSelect with required props preserved", () => {
		const options = [
			{ label: "Daily", value: "daily" },
			{ label: "Weekly", value: "weekly" },
		];

		const node = formSelect({
			name: "frequency",
			label: "Frequency",
			options,
			required: true,
			value: "daily",
		});

		expect(node.type).toBe("formSelect");
		expect(node.name).toBe("frequency");
		expect(node.label).toBe("Frequency");
		expect(node.options).toBe(options);
		expect(node.required).toBe(true);
		expect(node.value).toBe("daily");
		expect(node.__internalId).toMatch(/^formSelect-test-app-id-[a-z0-9]+$/);
	});

	it("produces different ids for selects with different options", () => {
		const a = formSelect({
			name: "x",
			label: "X",
			options: [{ label: "A", value: "a" }],
		});
		const b = formSelect({
			name: "x",
			label: "X",
			options: [{ label: "B", value: "b" }],
		});

		expect(a.__internalId).not.toBe(b.__internalId);
	});
});

describe("formRadio", () => {
	it("creates a formRadio with required props preserved", () => {
		const options = [
			{ label: "Daily", value: "daily" },
			{ label: "Weekly", value: "weekly" },
		];

		const node = formRadio({
			name: "frequency",
			label: "Frequency",
			options,
			required: true,
			value: "daily",
		});

		expect(node.type).toBe("formRadio");
		expect(node.name).toBe("frequency");
		expect(node.label).toBe("Frequency");
		expect(node.options).toBe(options);
		expect(node.required).toBe(true);
		expect(node.value).toBe("daily");
		expect(node.__internalId).toMatch(/^formRadio-test-app-id-[a-z0-9]+$/);
	});

	it("produces different ids for radios with different options", () => {
		const a = formRadio({
			name: "x",
			label: "X",
			options: [{ label: "A", value: "a" }],
		});
		const b = formRadio({
			name: "x",
			label: "X",
			options: [{ label: "B", value: "b" }],
		});

		expect(a.__internalId).not.toBe(b.__internalId);
	});
});

describe("formCheckbox", () => {
	it("creates a formCheckbox with required props preserved", () => {
		const node = formCheckbox({
			name: "terms",
			label: "I agree",
			required: true,
			checked: false,
			value: "yes",
		});

		expect(node.type).toBe("formCheckbox");
		expect(node.name).toBe("terms");
		expect(node.label).toBe("I agree");
		expect(node.required).toBe(true);
		expect(node.checked).toBe(false);
		expect(node.value).toBe("yes");
		expect(node.__internalId).toMatch(/^formCheckbox-test-app-id-[a-z0-9]+$/);
	});

	it("produces different ids for checkboxes with different default state", () => {
		const a = formCheckbox({ name: "x", label: "X", checked: true });
		const b = formCheckbox({ name: "x", label: "X", checked: false });

		expect(a.__internalId).not.toBe(b.__internalId);
	});
});

describe("conditional content", () => {
	it("formSuccess emits the right type tag and preserves children", () => {
		const node = formSuccess({ children: "Submitted!" });
		expect(node.type).toBe("formSuccess");
		expect(node.children).toBe("Submitted!");
		expect(node.__internalId).toMatch(/^formSuccess-test-app-id-[a-z0-9]+$/);
	});

	it("formFailure emits the right type tag and preserves children", () => {
		const node = formFailure({ children: "Failed!" });
		expect(node.type).toBe("formFailure");
		expect(node.children).toBe("Failed!");
		expect(node.__internalId).toMatch(/^formFailure-test-app-id-[a-z0-9]+$/);
	});

	it("formSending emits the right type tag and preserves children", () => {
		const node = formSending({ children: "Sending…" });
		expect(node.type).toBe("formSending");
		expect(node.children).toBe("Sending…");
		expect(node.__internalId).toMatch(/^formSending-test-app-id-[a-z0-9]+$/);
	});
});

describe("formResetter", () => {
	it("creates a formResetter with the label as children", () => {
		const node = formResetter({ children: "Reset" });

		expect(node.type).toBe("formResetter");
		expect(node.children).toBe("Reset");
		expect(node.__internalId).toMatch(/^formResetter-test-app-id-[a-z0-9]+$/);
	});

	it("forwards variant, disabled and accessible label", () => {
		const node = formResetter({
			children: "Reset",
			variant: "secondary",
			disabled: true,
			ariaLabel: "Clear all fields",
		});

		expect(node.variant).toBe("secondary");
		expect(node.disabled).toBe(true);
		expect(node.ariaLabel).toBe("Clear all fields");
	});
});

describe("formSubmitter", () => {
	it("creates a formSubmitter with the label as children", () => {
		const node = formSubmitter({ children: "Send" });

		expect(node.type).toBe("formSubmitter");
		expect(node.children).toBe("Send");
		expect(node.__internalId).toMatch(/^formSubmitter-test-app-id-[a-z0-9]+$/);
	});

	it("forwards the disabled flag", () => {
		const node = formSubmitter({ children: "Send", disabled: true });

		expect(node.disabled).toBe(true);
	});
});
