/*
  Warnings:

  - A unique constraint covering the columns `[lat,lon]` on the table `City` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `country` to the `City` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "City_name_key";

-- AlterTable
ALTER TABLE "City" ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "state" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "City_lat_lon_key" ON "City"("lat", "lon");
