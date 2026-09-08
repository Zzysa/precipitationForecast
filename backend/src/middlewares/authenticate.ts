import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../auth/token.js";

const authenticate = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const header = req.headers.authorization;
		const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

		if (!token) {
			res.status(401).json({ error: "Authentication required" });
			return;
		}

		const payload = await verifyToken(token);

		if (!payload.sub) {
			res.status(401).json({ error: "Authentication required" });
			return;
		}

		req.user = { id: Number(payload.sub) };
		next();
	} catch {
		res.status(401).json({ error: "Authentication required" });
	}
};

export { authenticate };
