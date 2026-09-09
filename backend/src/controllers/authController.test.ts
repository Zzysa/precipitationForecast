import type { Request, Response } from "express";
import { vi, expect, describe, it, beforeEach } from "vitest";
import { ZodError } from "zod";
import { getMe, login, register } from "./authController.js";
import { getMeById, loginUser, registerUser } from "../services/authService.js";
import { prisma } from "../db/prisma.js";

let req = {
	body: {
		username: "john",
		password: "password-strong",
	},
} as unknown as Request;

const res = {
	status: vi.fn().mockReturnThis(),
	send: vi.fn(),
	json: vi.fn(),
} as unknown as Response;

vi.mock("../services/authService.js", () => ({
	registerUser: vi.fn(),
	loginUser: vi.fn(),
	getMeById: vi.fn(),
}));

vi.mock("../db/prisma.js", () => ({
	prisma: {
		user: {
			findUniqueOrThrow: vi.fn(),
		},
	},
}));

beforeEach(() => {
	vi.clearAllMocks();
	req = {
		body: {
			username: "john",
			password: "password-strong",
		},
	} as unknown as Request;
});

describe("register", () => {
	it("returns correct status and json", async () => {
		await register(req, res);

		expect(registerUser).toHaveBeenCalledWith({
			username: "john",
			password: "password-strong",
		});
		expect(res.status).toHaveBeenCalledWith(201);
		expect(res.send).toHaveBeenCalledWith();
	});

	it("rejects invalid body", async () => {
		req = {
			body: {
				username: "",
				password: "",
			},
		} as unknown as Request;

		await expect(register(req, res)).rejects.toBeInstanceOf(ZodError);
		expect(registerUser).not.toHaveBeenCalled();
	});

	it("propagates service error", async () => {
		vi.mocked(registerUser).mockRejectedValueOnce(
			new Error("Username is already taken"),
		);
		await expect(register(req, res)).rejects.toThrow(
			"Username is already taken",
		);
	});
});

describe("login", () => {
	it("returns correct status and json", async () => {
		vi.mocked(loginUser).mockResolvedValueOnce("access-token");

		await login(req, res);

		expect(loginUser).toHaveBeenCalledWith({
			username: "john",
			password: "password-strong",
		});
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith({ accessToken: "access-token" });
	});

	it("rejects invalid body", async () => {
		req = {
			body: {
				username: "",
				password: "",
			},
		} as unknown as Request;

		await expect(login(req, res)).rejects.toBeInstanceOf(ZodError);
		expect(loginUser).not.toHaveBeenCalled();
	});

	it("propagates service error", async () => {
		vi.mocked(loginUser).mockRejectedValueOnce(new Error("Error"));
		await expect(login(req, res)).rejects.toThrow("Error");
	});
});

describe("getMe", () => {
	it("returns user by the id", async () => {
		const user = {
			id: 7,
			username: "john",
		};

		req = { user: { id: 7 } } as unknown as Request;
		vi.mocked(getMeById).mockResolvedValueOnce(user);

		await getMe(req, res);

		expect(getMeById).toHaveBeenCalledWith(7);
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith({ user });
	});

	it("throw when user is incorrect", async () => {
		req = { user: { id: 7 } } as unknown as Request;
		vi.mocked(getMeById).mockRejectedValueOnce(
			new Error("No record was found"),
		);

		await expect(getMe(req, res)).rejects.toThrow("No record was found");
	});
});
