import type { Request, Response } from "express";
import {
	getSearchHistoryForUser,
	deleteSearchHistoryByCityIdForUser,
} from "../services/searchHistoryService.js";
import { CityIdParamsSchema } from "../schemas/weatherSchemas.js";

const getSearchHistory = async (req: Request, res: Response) => {
	const data = await getSearchHistoryForUser(req.user!.id);

	res.status(200).json({ history: data });
};

const deleteSearchHistory = async (req: Request, res: Response) => {
	const { cityId } = CityIdParamsSchema.parse(req.params);

	await deleteSearchHistoryByCityIdForUser(cityId, req.user!.id);

	res.status(204).send();
};

export { getSearchHistory, deleteSearchHistory };
