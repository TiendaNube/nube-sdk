import type { Page } from "@tiendanube/nube-sdk-types";
import { describe, expect, it } from "vitest";
import {
	isAccountInfoPage,
	isAccountLoginPage,
	isAccountNewPasswordPage,
	isAccountOrdersPage,
	isAccountPage,
	isAccountRegisterPage,
	isAccountResetPage,
	isCategoryPage,
	isCheckoutPage,
	isHomePage,
	isProductPage,
} from "./pages.js";

describe("Page type guards", () => {
	it("isProductPage returns true for product page", () => {
		const page = {
			type: "product",
			data: { product: { id: 1 } },
		} as unknown as Page;
		expect(isProductPage(page)).toBe(true);
	});

	it("isProductPage returns false for other page types", () => {
		expect(
			isProductPage({ type: "category", data: {} } as unknown as Page),
		).toBe(false);
		expect(
			isProductPage({ type: "checkout", data: {} } as unknown as Page),
		).toBe(false);
		expect(isProductPage({ type: "home", data: {} } as unknown as Page)).toBe(
			false,
		);
	});

	it("isCategoryPage returns true for category page", () => {
		expect(
			isCategoryPage({ type: "category", data: {} } as unknown as Page),
		).toBe(true);
	});

	it("isCheckoutPage returns true for checkout page", () => {
		expect(
			isCheckoutPage({ type: "checkout", data: {} } as unknown as Page),
		).toBe(true);
	});

	it("isHomePage returns true for home page", () => {
		expect(isHomePage({ type: "home", data: {} } as unknown as Page)).toBe(
			true,
		);
	});

	it("isAccountPage returns true for any account page", () => {
		expect(
			isAccountPage({ type: "account.login", data: {} } as unknown as Page),
		).toBe(true);
		expect(
			isAccountPage({ type: "account.orders", data: {} } as unknown as Page),
		).toBe(true);
	});

	it("isAccountPage returns false for non-account pages", () => {
		expect(isAccountPage({ type: "home", data: {} } as unknown as Page)).toBe(
			false,
		);
	});

	it("isAccountLoginPage returns true for account login page", () => {
		expect(
			isAccountLoginPage({
				type: "account.login",
				data: {},
			} as unknown as Page),
		).toBe(true);
		expect(
			isAccountLoginPage({
				type: "account.register",
				data: {},
			} as unknown as Page),
		).toBe(false);
	});

	it("isAccountRegisterPage returns true for account register page", () => {
		expect(
			isAccountRegisterPage({
				type: "account.register",
				data: {},
			} as unknown as Page),
		).toBe(true);
	});

	it("isAccountInfoPage returns true for account info page", () => {
		expect(
			isAccountInfoPage({ type: "account.info", data: {} } as unknown as Page),
		).toBe(true);
	});

	it("isAccountResetPage returns true for account reset page", () => {
		expect(
			isAccountResetPage({
				type: "account.reset",
				data: {},
			} as unknown as Page),
		).toBe(true);
	});

	it("isAccountOrdersPage returns true for account orders page", () => {
		expect(
			isAccountOrdersPage({
				type: "account.orders",
				data: {},
			} as unknown as Page),
		).toBe(true);
	});

	it("isAccountNewPasswordPage returns true for account new password page", () => {
		expect(
			isAccountNewPasswordPage({
				type: "account.newpass",
				data: {},
			} as unknown as Page),
		).toBe(true);
		expect(
			isAccountNewPasswordPage({
				type: "account.reset",
				data: {},
			} as unknown as Page),
		).toBe(false);
	});
});
