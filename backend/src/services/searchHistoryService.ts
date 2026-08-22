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

const deleteSearchHistoryByCityNameForDemoUser = async (city: string) => {
	const demoUser = await prisma.user.findUniqueOrThrow({
		where: { username: "demo" },
		select: { id: true },
	});

	await prisma.searchHistory.deleteMany({
		where: {
			userId: demoUser.id,
			city: {
				name: city,
			},
		},
	});
};

export {
	getSearchHistoryForDemoUser,
	deleteSearchHistoryByCityNameForDemoUser,
};
