/*
  Warnings:

  - You are about to drop the column `fileName` on the `Image` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `Image` table. All the data in the column will be lost.
  - Added the required column `imageName` to the `Image` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageUrl` to the `Image` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Image" DROP COLUMN "fileName",
DROP COLUMN "url",
ADD COLUMN     "imageName" TEXT NOT NULL,
ADD COLUMN     "imageUrl" TEXT NOT NULL;
