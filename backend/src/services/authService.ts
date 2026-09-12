import { createToken } from "../auth/token.js";
import { prisma } from "../db/prisma.js";
import type {
	LoginBodyType,
	RegisterBodyType,
} from "../schemas/authSchemas.js";
import { Prisma } from "@prisma/client";
import { HttpError } from "../errors/HttpError.js";
import * as argon2 from "argon2";

const registerUser = async (input: RegisterBodyType) => {
	const { username, password } = input;

	const passwordHash = await argon2.hash(password);

	try {
		await prisma.user.create({ data: { username, passwordHash } });
	} catch (err) {
		if (
			err instanceof Prisma.PrismaClientKnownRequestError &&
			err.code === "P2002"
		) {
			throw new HttpError(409, "Username is already taken");
		}
		throw err;
	}
};

const loginUser = async (input: LoginBodyType) => {
	const user = await prisma.user.findUnique({
		where: { username: input.username },
	});

	const isPasswordValid =
		user !== null && (await argon2.verify(user.passwordHash, input.password));

	if (!isPasswordValid) {
		throw new HttpError(401, "Invalid credentials");
	}

	return createToken(user.id);
};

const getMeById = async (userId: number) => {
	return prisma.user.findUniqueOrThrow({
		where: { id: userId },
		select: { id: true, username: true },
	});
};

export { registerUser, loginUser, getMeById };

