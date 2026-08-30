import type { Request, Response } from "express";
import { vi, expect, describe, it, beforeEach } from "vitest";
import {
	createFavorite,
	deleteFavorite,
	getFavorites,
} from "./favoritesController.js";
import {
	createFavoriteForDemoUser,
	deleteFavoriteForDemoUser,
	getFavoriteForDemoUser,
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
	json: vi.fn(),
} as unknown as Response;

let req = {
	body: city,
} as unknown as Request;

const expectedFavorites = [
	{
		id: 1,
		userId: 7,
		cityId: 3,
		createdAt: new Date(),
		city: {
			id: 3,
			name: "Gdansk",
			state: null,
			country: "PL",
			lat: 52.52,
			lon: 13.41,
		},
	},
];

vi.mock("../services/favoritesService.js", () => ({
	createFavoriteForDemoUser: vi.fn(),
	deleteFavoriteForDemoUser: vi.fn(),
	getFavoriteForDemoUser: vi.fn(),
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

describe("getFavorites", () => {
	it("returns favorites", async () => {
		vi.mocked(getFavoriteForDemoUser).mockResolvedValue(expectedFavorites);

		await getFavorites(req, res);

		expect(getFavoriteForDemoUser).toHaveBeenCalled();
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith({ favorites: expectedFavorites });
	});

	it("propagates service error", async () => {
		vi.mocked(getFavoriteForDemoUser).mockRejectedValue(new Error("API down"));
		await expect(getFavorites(req, res)).rejects.toThrow("API down");
	});
});
