import { Router } from "express";
import { getSearchHistory, deleteSearchHistory } from "../controllers/searchHistoryController.js";

const searchHistoryRoutes = Router();

searchHistoryRoutes.get("/", getSearchHistory);
searchHistoryRoutes.delete("/:city", deleteSearchHistory)

export { searchHistoryRoutes };
