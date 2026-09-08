import { describe, it, expect } from "vitest";
import { createToken, verifyToken } from "./token.js";

process.env.JWT_SECRET = "test-secret";

describe("verifyToken and createToken", () => {
	it("create and verify token", async () => {
		const token = await createToken(7);
		const payload = await verifyToken(token);

		expect(payload.sub).toBe("7");
	});

	it("throw when a token is invalid", async () => {
		await expect(verifyToken("not-a-jwt")).rejects.toThrow();
	});
});
