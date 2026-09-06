import { createToken } from "../auth/token.js";
import { prisma } from "../db/prisma.js";
import type {
	LoginBodyType,
	RegisterBodyType,
} from "../schemas/authSchemas.js";
import * as argon2 from "argon2";

const registerUser = async (input: RegisterBodyType) => {
	const { username, password } = input;

	const passwordHash = await argon2.hash(password);

	await prisma.user.create({ data: { username, passwordHash } });
};

const loginUser = async (input: LoginBodyType) => {
	const user = await prisma.user.findUnique({
		where: { username: input.username },
	});

	const isPasswordValid =
		user !== null && (await argon2.verify(user.passwordHash, input.password));

	if (!isPasswordValid) {
		throw new Error("Invalid credentials");
	}

	return createToken(user.id);
};

export { registerUser, loginUser };
