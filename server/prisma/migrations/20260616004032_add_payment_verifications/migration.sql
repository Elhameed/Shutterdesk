-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "payment_verifications" (
    "id" TEXT NOT NULL,
    "payment_request_id" TEXT,
    "booking_id" TEXT NOT NULL,
    "studio_id" TEXT NOT NULL,
    "client_name" TEXT NOT NULL,
    "client_email" TEXT NOT NULL,
    "client_avatar_asset_key" TEXT,
    "transaction_id" TEXT NOT NULL,
    "booking_title" TEXT NOT NULL,
    "package_name" TEXT NOT NULL,
    "booking_date" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "receipt_asset_key" TEXT NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'pending',
    "high_priority" BOOLEAN NOT NULL DEFAULT false,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_records" (
    "id" TEXT NOT NULL,
    "client_email" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "studio_id" TEXT NOT NULL,
    "studio_name" TEXT NOT NULL,
    "payment_request_id" TEXT,
    "payment_verification_id" TEXT,
    "booking_title" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "paid_at" TIMESTAMP(3) NOT NULL,
    "status" "VerificationStatus" NOT NULL,
    "receipt_asset_key" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_records_payment_verification_id_key" ON "payment_records"("payment_verification_id");

-- AddForeignKey
ALTER TABLE "payment_verifications" ADD CONSTRAINT "payment_verifications_payment_request_id_fkey" FOREIGN KEY ("payment_request_id") REFERENCES "payment_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_verifications" ADD CONSTRAINT "payment_verifications_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_verifications" ADD CONSTRAINT "payment_verifications_studio_id_fkey" FOREIGN KEY ("studio_id") REFERENCES "studios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_payment_verification_id_fkey" FOREIGN KEY ("payment_verification_id") REFERENCES "payment_verifications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_studio_id_fkey" FOREIGN KEY ("studio_id") REFERENCES "studios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
