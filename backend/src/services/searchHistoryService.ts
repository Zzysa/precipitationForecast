import { prisma } from "../db/prisma.js";

const getSearchHistoryForUser = async (userId: number) => {
	return prisma.searchHistory.findMany({
		where: { userId },
		include: { city: true },
		orderBy: { searchedAt: "desc" },
		take: 10,
	});
};

const deleteSearchHistoryByCityIdForUser = async (
	cityId: number,
	userId: number,
) => {
	await prisma.searchHistory.deleteMany({
		where: {
			userId,
			cityId,
		},
	});
};

export { getSearchHistoryForUser, deleteSearchHistoryByCityIdForUser };
