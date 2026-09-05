import type { Request, Response } from "express";
import { vi, expect, describe, it, beforeEach } from "vitest";
import { ZodError } from "zod";
import { register } from "./authController.js";
import { registerUser } from "../services/authService.js";

let req = {
	body: {
		username: "john",
		password: "password-strong",
	},
} as unknown as Request;

const res = {
	status: vi.fn().mockReturnThis(),
	send: vi.fn(),
} as unknown as Response;

vi.mock("../services/authService.js", () => ({
	registerUser: vi.fn(),
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
