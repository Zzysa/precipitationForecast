import { Router } from "express";
import { getMe, login, register } from "../controllers/authController.js";
import { authenticate } from "../middlewares/authenticate.js";

const authRoutes = Router();

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.get("/me", authenticate, getMe);

export { authRoutes };
