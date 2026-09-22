import { describe, expect, it } from "vitest";
import { tableBody } from "./table-body";
import { tableRoot } from "./table-root";

describe("tableRoot", () => {
	it("creates a tableRoot with the type tag and a stable internal id", () => {
		const node = tableRoot({ variant: "surface", children: "content" });

		expect(node.type).toBe("tableRoot");
		expect(node.variant).toBe("surface");
		expect(node.children).toBe("content");
		expect(node.__internalId).toMatch(/^tableRoot-test-app-id-[a-z0-9]+$/);
	});

	it("forwards data and columns", () => {
		const data = [
			{ nome: "minato", cor: "laranja", peso: 4.9 },
			{ nome: "maple", cor: "tricolor", peso: 2.6 },
		];
		const columns = [
			{ key: "nome", label: "Nome do animal" },
			{ key: "peso", label: "Peso em kg" },
		];

		const node = tableRoot({ variant: "surface", data, columns });

		expect(node.data).toEqual(data);
		expect(node.columns).toEqual(columns);
	});

	it("only accepts column keys present in data", () => {
		const data = [{ nome: "minato", peso: 4.9 }];

		const node = tableRoot({
			data,
			columns: [
				{ key: "nome" },
				// @ts-expect-error "name" is not a key of the rows of `data`
				{ key: "name" },
			],
		});

		expect(node.columns).toEqual([{ key: "nome" }, { key: "name" }]);
	});

	it("ignores children when both data and columns are provided", () => {
		const node = tableRoot({
			data: [{ nome: "minato" }],
			columns: [{ key: "nome", label: "Nome do animal" }],
			children: tableBody({ children: "ignored" }),
		});

		expect(node.children).toBeUndefined();
		expect("children" in node).toBe(false);
	});

	it("keeps children when only one of data or columns is provided", () => {
		const withoutColumns = tableRoot({
			data: [{ nome: "minato" }],
			children: "content",
		});
		const withoutData = tableRoot({
			columns: [{ key: "nome" }],
			children: "content",
		});

		expect(withoutColumns.children).toBe("content");
		expect(withoutData.children).toBe("content");
	});
});
