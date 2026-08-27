import { Router } from "express";
import {
	createFavorite,
	deleteFavorite,
} from "../controllers/favoritesController.js";

const favoritesRoutes = Router();

favoritesRoutes.post("/", createFavorite);
favoritesRoutes.delete("/:cityId", deleteFavorite);

export { favoritesRoutes };
