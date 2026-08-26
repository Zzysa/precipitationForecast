import { Router } from "express";
import { createFavorite } from "../controllers/favoritesController.js";

const favoritesRoutes = Router();

favoritesRoutes.post("/", createFavorite);

export { favoritesRoutes };
