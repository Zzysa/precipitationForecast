import { prisma } from "../db/prisma.js";
import { vi, describe, it, expect, beforeEach } from "vitest";
import * as argon2 from "argon2";
import { loginUser, registerUser } from "./authService.js";
import { createToken } from "../auth/token.js";

const savedUser = {
	id: 7,
	username: "john",
	passwordHash: "hashed-password",
};

const input = {
	username: "john",
	password: "password",
};

vi.mock("../db/prisma.js", () => ({
	prisma: {
		user: {
			create: vi.fn(),
			findUnique: vi.fn(),
		},
	},
}));

vi.mock("argon2", () => ({
	hash: vi.fn(),
	verify: vi.fn(),
}));

vi.mock("../auth/token.js", () => ({
	createToken: vi.fn(),
}));

vi.mocked(argon2.hash).mockResolvedValue("hashed-password");

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

describe("loginUser", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(prisma.user.findUnique).mockResolvedValue(savedUser);
		vi.mocked(argon2.verify).mockResolvedValue(true);
		vi.mocked(createToken).mockResolvedValue("fake.jwt.token");
	});

	it("returns an access token", async () => {
		const res = await loginUser(input);

		expect(res).toBe("fake.jwt.token");
		expect(prisma.user.findUnique).toHaveBeenCalledWith({
			where: { username: input.username },
		});
		expect(argon2.verify).toHaveBeenCalledWith(
			savedUser.passwordHash,
			input.password,
		);
		expect(createToken).toHaveBeenCalledWith(savedUser.id);
	});

	it("throws when user is null", async () => {
		vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);

		await expect(loginUser(input)).rejects.toThrow("Invalid credentials");
		expect(prisma.user.findUnique).toHaveBeenCalledWith({
			where: { username: input.username },
		});
		expect(argon2.verify).not.toHaveBeenCalled();
		expect(createToken).not.toHaveBeenCalled();
	});

	it("throws when verification is failed", async () => {
		vi.mocked(argon2.verify).mockResolvedValueOnce(false);

		await expect(loginUser(input)).rejects.toThrow("Invalid credentials");
		expect(prisma.user.findUnique).toHaveBeenCalledWith({
			where: { username: input.username },
		});
		expect(argon2.verify).toHaveBeenCalledWith("hashed-password", "password");
		expect(createToken).not.toHaveBeenCalled();
	});
});
