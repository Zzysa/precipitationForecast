import type { Request, Response } from "express";
import {
	getSearchHistoryForDemoUser,
	deleteSearchHistoryByCityIdForDemoUser,
} from "../services/searchHistoryService.js";
import { CityIdParamsSchema } from "../schemas/weatherSchemas.js";

const getSearchHistory = async (req: Request, res: Response) => {
	const data = await getSearchHistoryForDemoUser();

	res.status(200).json({ history: data });
};

const deleteSearchHistory = async (req: Request, res: Response) => {
	const { cityId } = CityIdParamsSchema.parse(req.params);

	await deleteSearchHistoryByCityIdForDemoUser(cityId);

	res.status(204).send();
};

export { getSearchHistory, deleteSearchHistory };
