import { prisma } from "../src/db/prisma.js"

try {
    await prisma.user.upsert({
        where: {username: "demo"},
        update: {},
        create: {username: "demo"},
    })
} finally {
    await prisma.$disconnect();
}