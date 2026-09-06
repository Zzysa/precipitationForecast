import type { Request, Response } from "express";
import { loginUser, registerUser } from "../services/authService.js";
import { LoginBodySchema, RegisterBodySchema } from "../schemas/authSchemas.js";

const register = async (req: Request, res: Response) => {
	const input = RegisterBodySchema.parse(req.body);

	await registerUser(input);

	res.status(201).send();
};

const login = async (req: Request, res: Response) => {
	const input = LoginBodySchema.parse(req.body);
	const accessToken = await loginUser(input);

	res.status(200).json({ accessToken });
};

export { register, login };
