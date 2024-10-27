-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PAYMENT_SUCCESFULL', 'PAYMENT_FAILED');

-- CreateTable
CREATE TABLE "Payments" (
    "id" SERIAL NOT NULL,
    "order_id" VARCHAR(256) NOT NULL,
    "payment_id" VARCHAR(256) NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL,

    CONSTRAINT "Payments_pkey" PRIMARY KEY ("id")
);
