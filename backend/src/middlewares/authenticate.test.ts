import type { NextFunction, Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { authenticate, authenticateOptional } from "./authenticate.js";
import { verifyToken } from "../auth/token.js";

vi.mock("../auth/token.js", () => ({
	verifyToken: vi.fn(),
}));

const res = {
	status: vi.fn().mockReturnThis(),
	json: vi.fn(),
} as unknown as Response;

const next = vi.fn() as NextFunction;

const createRequest = (authorization?: string) =>
	({
		headers: { authorization },
	}) as unknown as Request;

beforeEach(() => {
	vi.clearAllMocks();
});

describe("authenticate", () => {
	it("returns 401 when authorization header is missing", async () => {
		const req = createRequest();

		await authenticate(req, res, next);

		expect(verifyToken).not.toHaveBeenCalled();
		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith({
			error: "Authentication required",
		});
		expect(next).not.toHaveBeenCalled();
	});

	it("returns 401 when the scheme is not Bearer", async () => {
		const req = createRequest("Basic abc");

		await authenticate(req, res, next);

		expect(verifyToken).not.toHaveBeenCalled();
		expect(res.status).toHaveBeenCalledWith(401);
		expect(next).not.toHaveBeenCalled();
	});

	it("sets req.user and calls next for a valid token", async () => {
		const req = createRequest("Bearer valid-token");
		vi.mocked(verifyToken).mockResolvedValueOnce({ sub: "7" });

		await authenticate(req, res, next);

		expect(verifyToken).toHaveBeenCalledWith("valid-token");
		expect(req.user).toEqual({ id: 7 });
		expect(next).toHaveBeenCalledOnce();
		expect(res.status).not.toHaveBeenCalled();
	});

	it("returns 401 when the token has no sub", async () => {
		const req = createRequest("Bearer valid-token");
		vi.mocked(verifyToken).mockResolvedValueOnce({});

		await authenticate(req, res, next);

		expect(res.status).toHaveBeenCalledWith(401);
		expect(next).not.toHaveBeenCalled();
	});

	it("returns 401 when verifyToken throws", async () => {
		const req = createRequest("Bearer invalid-token");
		vi.mocked(verifyToken).mockRejectedValueOnce(new Error("invalid"));

		await authenticate(req, res, next);

		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith({
			error: "Authentication required",
		});
		expect(next).not.toHaveBeenCalled();
	});
});

describe("authenticateOptional", () => {
	it("calls next without user when authorization header is missing", async () => {
		const req = createRequest();

		await authenticateOptional(req, res, next);

		expect(verifyToken).not.toHaveBeenCalled();
		expect(req.user).toBeUndefined();
		expect(next).toHaveBeenCalledOnce();
		expect(res.status).not.toHaveBeenCalled();
	});

	it("sets req.user and calls next for a valid token", async () => {
		const req = createRequest("Bearer valid-token");
		vi.mocked(verifyToken).mockResolvedValueOnce({ sub: "7" });

		await authenticateOptional(req, res, next);

		expect(verifyToken).toHaveBeenCalledWith("valid-token");
		expect(req.user).toEqual({ id: 7 });
		expect(next).toHaveBeenCalledOnce();
		expect(res.status).not.toHaveBeenCalled();
	});

	it("returns 401 when the token is invalid", async () => {
		const req = createRequest("Bearer invalid-token");
		vi.mocked(verifyToken).mockRejectedValueOnce(new Error("invalid"));

		await authenticateOptional(req, res, next);

		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith({
			error: "Authentication required",
		});
		expect(next).not.toHaveBeenCalled();
	});
});
