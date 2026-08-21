import type { Request, Response } from "express";
import { getSearchHistoryForDemoUser } from "../services/searchHistoryService.js";

const getSearchHistory = async (req: Request, res: Response) => {
	const data = await getSearchHistoryForDemoUser();

	res.status(200).json({ history: data });
};

export { getSearchHistory };
