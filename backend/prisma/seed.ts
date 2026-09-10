import { prisma } from "../src/db/prisma.js";
import * as argon2 from "argon2";

const passwordHash = await argon2.hash("demo-password-123");

try {
	await prisma.user.upsert({
		where: { username: "demo" },
		update: { passwordHash },
		create: { username: "demo", passwordHash },
	});
} finally {
	await prisma.$disconnect();
}
