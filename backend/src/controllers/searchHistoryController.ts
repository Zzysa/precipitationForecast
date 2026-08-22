import type { Request, Response } from "express";
import {
	getSearchHistoryForDemoUser,
	deleteSearchHistoryByCityNameForDemoUser,
} from "../services/searchHistoryService.js";
import { CityParamsSchema } from "../schemas/weatherSchemas.js";

const getSearchHistory = async (req: Request, res: Response) => {
	const data = await getSearchHistoryForDemoUser();

	res.status(200).json({ history: data });
};

const deleteSearchHistory = async (req: Request, res: Response) => {
	const { city } = CityParamsSchema.parse(req.params);

	await deleteSearchHistoryByCityNameForDemoUser(city);

	res.status(204).send();
};

export { getSearchHistory, deleteSearchHistory };
