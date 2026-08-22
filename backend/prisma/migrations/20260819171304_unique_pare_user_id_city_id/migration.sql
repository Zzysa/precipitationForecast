/*
  Warnings:

  - A unique constraint covering the columns `[userId,cityId]` on the table `SearchHistory` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SearchHistory_userId_cityId_key" ON "SearchHistory"("userId", "cityId");
