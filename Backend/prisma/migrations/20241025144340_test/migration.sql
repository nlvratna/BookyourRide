/*
  Warnings:

  - You are about to drop the column `order_id` on the `Payments` table. All the data in the column will be lost.
  - Added the required column `orders` to the `Payments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Payments" DROP COLUMN "order_id",
ADD COLUMN     "orders" VARCHAR(256) NOT NULL;
