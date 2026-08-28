import type { Request, Response } from "express";
import {
	CityIdParamsSchema,
	CreateFavoriteBodySchema,
} from "../schemas/weatherSchemas.js";
import {
	createFavoriteForDemoUser,
	deleteFavoriteForDemoUser,
	getFavoriteForDemoUser,
} from "../services/favoritesService.js";

const createFavorite = async (req: Request, res: Response) => {
	const city = CreateFavoriteBodySchema.parse(req.body);

	await createFavoriteForDemoUser(city);

	res.status(201).send();
};

const deleteFavorite = async (req: Request, res: Response) => {
	const { cityId } = CityIdParamsSchema.parse(req.params);

	await deleteFavoriteForDemoUser(cityId);

	res.status(204).send();
};

const getFavorites = async (req: Request, res: Response) => {
	const data = await getFavoriteForDemoUser();

	res.status(200).json({ favorites: data });
};

export { createFavorite, deleteFavorite, getFavorites };
