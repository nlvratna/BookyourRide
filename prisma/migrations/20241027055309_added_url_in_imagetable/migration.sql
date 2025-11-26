/*
  Warnings:

  - The values [PAYMENT_SUCCESFULL,PAYMENT_FAILED] on the enum `PaymentStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `orders` on the `Payments` table. All the data in the column will be lost.
  - Added the required column `imageUrl` to the `Image` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order_id` to the `Payments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PaymentStatus_new" AS ENUM ('SUCCESS', 'FAILED');
ALTER TABLE "Payments" ALTER COLUMN "paymentStatus" TYPE "PaymentStatus_new" USING ("paymentStatus"::text::"PaymentStatus_new");
ALTER TYPE "PaymentStatus" RENAME TO "PaymentStatus_old";
ALTER TYPE "PaymentStatus_new" RENAME TO "PaymentStatus";
DROP TYPE "PaymentStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "imageUrl" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Payments" DROP COLUMN "orders",
ADD COLUMN     "order_id" VARCHAR(256) NOT NULL;
