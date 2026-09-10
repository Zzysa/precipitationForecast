import { Router } from "express";
import {
	getSearchHistory,
	deleteSearchHistory,
} from "../controllers/searchHistoryController.js";
import { authenticate } from "../middlewares/authenticate.js";

const searchHistoryRoutes = Router();

searchHistoryRoutes.get("/", authenticate, getSearchHistory);
searchHistoryRoutes.delete("/:cityId", authenticate, deleteSearchHistory);

export { searchHistoryRoutes };
