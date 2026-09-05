import { RegisterBodySchema } from "./authSchemas.js";
import { describe, it, expect } from "vitest";

describe("RegisterBodySchema", () => {
	const valid = {
		username: "john",
		password: "strong-password",
	};

	it("parses valid body", () => {
		expect(RegisterBodySchema.parse(valid)).toEqual(valid);
	});

	it("trims username", () => {
		expect(
			RegisterBodySchema.parse({ ...valid, username: "  john  " }),
		).toEqual(valid);
	});

	it("does not trim password", () => {
		expect(
			RegisterBodySchema.parse({
				...valid,
				password: "  strong-password  ",
			}),
		).toEqual({
			username: "john",
			password: "  strong-password  ",
		});
	});

	it("rejects a numeric username", () => {
		expect(() =>
			RegisterBodySchema.parse({ ...valid, username: 123 }),
		).toThrow("Username must be a string");
	});

	it("rejects a username shorter than 3 characters", () => {
		expect(() =>
			RegisterBodySchema.parse({ ...valid, username: "jo" }),
		).toThrow("Username must contain at least 3 characters");
	});

	it("rejects a username longer than 30 characters", () => {
		expect(() =>
			RegisterBodySchema.parse({
				...valid,
				username: "j".repeat(31),
			}),
		).toThrow("Username must contain at most 30 characters");
	});

	it("rejects a numeric password", () => {
		expect(() =>
			RegisterBodySchema.parse({ ...valid, password: 123 }),
		).toThrow("Password must be a string");
	});

	it("rejects a password shorter than 12 characters", () => {
		expect(() =>
			RegisterBodySchema.parse({ ...valid, password: "short-pass" }),
		).toThrow("Password must contain at least 12 characters");
	});

	it("rejects a password longer than 128 characters", () => {
		expect(() =>
			RegisterBodySchema.parse({
				...valid,
				password: "p".repeat(129),
			}),
		).toThrow("Password must contain at most 128 characters");
	});
});
