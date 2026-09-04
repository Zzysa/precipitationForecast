import { prisma } from "../db/prisma.js";
import type { RegisterBodyType } from "../schemas/authSchemas.js";
import * as argon2 from "argon2";

const registerUser = async (input: RegisterBodyType) => {
	const { username, password } = input;

	const passwordHash = await argon2.hash(password);

	await prisma.user.create({ data: { username, passwordHash } });
};

export { registerUser };
