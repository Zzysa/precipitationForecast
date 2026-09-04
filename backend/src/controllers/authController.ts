import type { Request, Response } from "express";
import { registerUser } from "../services/authService.js";
import { RegisterBodySchema } from "../schemas/authSchemas.js";

const register = async (req: Request, res: Response) => {
	const input = RegisterBodySchema.parse(req.body);

	await registerUser(input);

	res.status(201).send();
};

export { register };
