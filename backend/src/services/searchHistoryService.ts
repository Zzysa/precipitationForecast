import { prisma } from "../db/prisma.js";

const getSearchHistoryForDemoUser = async () => {
	const demoUser = await prisma.user.findUniqueOrThrow({
		where: { username: "demo" },
		select: { id: true },
	});

	return prisma.searchHistory.findMany({
		where: { userId: demoUser.id },
		include: { city: true },
		orderBy: { searchedAt: "desc" },
		take: 10,
	});
};

export { getSearchHistoryForDemoUser };
