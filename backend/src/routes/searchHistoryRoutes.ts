import { Router } from "express";
import { getSearchHistory } from "../controllers/searchHistoryController.js";

const searchHistoryRoutes = Router();

searchHistoryRoutes.get("/", getSearchHistory);

export { searchHistoryRoutes };
