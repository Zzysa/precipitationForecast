import { createToken } from "../auth/token.js";
import { prisma } from "../db/prisma.js";

process.env.JWT_SECRET ??= "secret";

const getAccessToken = async (username: string) => {
	const user = await prisma.user.findUniqueOrThrow({
		where: { username },
		select: { id: true },
	});

	return createToken(user.id);
};

export { getAccessToken };
