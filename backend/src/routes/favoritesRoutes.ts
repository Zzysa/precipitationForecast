import { Router } from "express";
import {
	createFavorite,
	deleteFavorite,
	getFavorites,
} from "../controllers/favoritesController.js";

const favoritesRoutes = Router();

favoritesRoutes.post("/", createFavorite);
favoritesRoutes.delete("/:cityId", deleteFavorite);
favoritesRoutes.get("/", getFavorites);

export { favoritesRoutes };
