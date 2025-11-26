/*
  Warnings:

  - Changed the type of `pricePerDay` on the `Car` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Car" DROP COLUMN "pricePerDay",
ADD COLUMN     "pricePerDay" MONEY NOT NULL;
