import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

const errorHandler = (
	err: unknown,
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	if (err instanceof ZodError) {
		return res.status(400).json({ error: err.issues });
	}

	if (err instanceof Error) {
		return res.status(500).json({ error: err.message });
	}

	return res.status(500).json({ error: "Internal Server Error" });
};

export { errorHandler };
