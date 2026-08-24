import { Router } from "express";
import {
	getSearchHistory,
	deleteSearchHistory,
} from "../controllers/searchHistoryController.js";

const searchHistoryRoutes = Router();

searchHistoryRoutes.get("/", getSearchHistory);
searchHistoryRoutes.delete("/:cityId", deleteSearchHistory);

export { searchHistoryRoutes };
