import type { Request, Response } from "express";
import { CreateFavoriteBodySchema } from "../schemas/weatherSchemas.js";
import { createFavoriteForDemoUser } from "../services/favoritesService.js";

const createFavorite = async (req: Request, res: Response) => {
	const city = CreateFavoriteBodySchema.parse(req.body);

	await createFavoriteForDemoUser(city);

	res.status(201).send();
};

export { createFavorite };
