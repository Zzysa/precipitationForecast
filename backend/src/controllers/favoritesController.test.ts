import type { Request, Response } from "express";
import { vi, expect, describe, it, beforeEach } from "vitest";
import { createFavorite, deleteFavorite } from "./favoritesController.js";
import {
	createFavoriteForDemoUser,
	deleteFavoriteForDemoUser,
} from "../services/favoritesService.js";
import { ZodError } from "zod";

const city = {
	name: "Gdansk",
	state: null,
	country: "PL",
	lat: 54.352,
	lon: 18.6466,
};

const res = {
	status: vi.fn().mockReturnThis(),
	send: vi.fn(),
} as unknown as Response;

let req = {
	body: city,
} as unknown as Request;

vi.mock("../services/favoritesService.js", () => ({
	createFavoriteForDemoUser: vi.fn(),
	deleteFavoriteForDemoUser: vi.fn(),
}));

beforeEach(() => {
	vi.clearAllMocks();
	req = {
		body: city,
	} as unknown as Request;
});

describe("createFavorite", () => {
	it("return correct status", async () => {
		await createFavorite(req, res);

		expect(createFavoriteForDemoUser).toHaveBeenCalledWith(city);
		expect(res.status).toHaveBeenCalledWith(201);
		expect(res.send).toHaveBeenCalledWith();
	});

	it("rejects invalid body", async () => {
		req = { body: {} } as unknown as Request;

		await expect(createFavorite(req, res)).rejects.toBeInstanceOf(ZodError);
		expect(createFavoriteForDemoUser).not.toHaveBeenCalled();
	});
});

describe("deleteFavorite", () => {
	it("return correct status", async () => {
		req = { params: { cityId: "15" } } as unknown as Request;

		await deleteFavorite(req, res);

		expect(deleteFavoriteForDemoUser).toHaveBeenCalledWith(15);
		expect(res.status).toHaveBeenCalledWith(204);
		expect(res.send).toHaveBeenCalledWith();
	});

	it("rejects invalid params", async () => {
		req = { params: {} } as unknown as Request;

		await expect(deleteFavorite(req, res)).rejects.toBeInstanceOf(ZodError);
		expect(deleteFavoriteForDemoUser).not.toHaveBeenCalled();
	});
});
