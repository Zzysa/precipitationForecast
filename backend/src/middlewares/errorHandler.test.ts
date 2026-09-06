import { z } from "zod";
import { errorHandler } from "./errorHandler.js";
import { it, describe, expect, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";
import type { NextFunction } from "express";

const res = {
	status: vi.fn().mockReturnThis(),
	json: vi.fn(),
} as unknown as Response;

const req = {} as unknown as Request;
const next = vi.fn() as NextFunction;

beforeEach(() => vi.clearAllMocks());

describe("errorHandler", () => {
	it("ZodError", () => {
		const schema = z.string();
		const result = schema.safeParse(123);

		if (!result.success) {
			errorHandler(result.error, req, res, next);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({ error: result.error.issues });
		}
	});

	it("new Error", () => {
		const error = new Error("boom");
		errorHandler(error, req, res, next);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({ error: error.message });
	});

	it("unknown Error", () => {
		const error = "boom";
		errorHandler(error, req, res, next);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
	});
});
