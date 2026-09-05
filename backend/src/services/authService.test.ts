import { prisma } from "../db/prisma.js";
import { vi, describe, it, expect } from "vitest";
import * as argon2 from "argon2";
import { registerUser } from "./authService.js";

vi.mock("../db/prisma.js", () => ({
	prisma: {
		user: {
			create: vi.fn(),
		},
	},
}));

vi.mock("argon2", () => ({
	hash: vi.fn(),
}));

vi.mocked(argon2.hash).mockResolvedValue("hashed-password");

const input = {
	username: "john",
	password: "password",
};

describe("registerUser", () => {
	it("creates a user with a hashed password", async () => {
		await registerUser(input);

		expect(argon2.hash).toHaveBeenCalledWith(input.password);
		expect(prisma.user.create).toHaveBeenCalledWith({
			data: {
				username: input.username,
				passwordHash: "hashed-password",
			},
		});
	});
});
