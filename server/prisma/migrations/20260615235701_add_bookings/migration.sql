-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "BookingPaymentStatus" AS ENUM ('unpaid', 'partial', 'paid');

-- CreateEnum
CREATE TYPE "PaymentRequestType" AS ENUM ('deposit', 'balance', 'full');

-- CreateEnum
CREATE TYPE "PaymentRequestStatus" AS ENUM ('unpaid', 'pending', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "studio_id" TEXT NOT NULL,
    "client_id" TEXT,
    "reference" TEXT NOT NULL,
    "client_name" TEXT NOT NULL,
    "client_email" TEXT NOT NULL,
    "client_avatar_asset_key" TEXT,
    "package_name" TEXT NOT NULL,
    "package_detail" TEXT NOT NULL,
    "package_price" INTEGER NOT NULL,
    "package_includes" JSONB,
    "session_at" TIMESTAMP(3) NOT NULL,
    "session_date_label" TEXT NOT NULL,
    "session_time" TEXT NOT NULL,
    "time_window" TEXT,
    "venue" TEXT,
    "city" TEXT,
    "location_notes" TEXT,
    "status" "BookingStatus" NOT NULL,
    "payment_status" "BookingPaymentStatus" NOT NULL,
    "detail_status" TEXT NOT NULL DEFAULT 'pending',
    "amount_paid" INTEGER NOT NULL DEFAULT 0,
    "deposit_percent" INTEGER NOT NULL DEFAULT 50,
    "timeline" JSONB,
    "progress_step" INTEGER NOT NULL DEFAULT 0,
    "gallery_step" INTEGER NOT NULL DEFAULT 0,
    "show_verify_payment" BOOLEAN NOT NULL DEFAULT false,
    "payment_meta" JSONB,
    "client_meta" JSONB,
    "internal_notes" TEXT,
    "gallery_id" TEXT,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_requests" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "studio_id" TEXT NOT NULL,
    "type" "PaymentRequestType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "PaymentRequestStatus" NOT NULL DEFAULT 'unpaid',
    "due_date" TIMESTAMP(3),
    "invoice_ref" TEXT,
    "booking_reference" TEXT,
    "booking_title" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bookings_reference_key" ON "bookings"("reference");

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_studio_id_fkey" FOREIGN KEY ("studio_id") REFERENCES "studios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_requests" ADD CONSTRAINT "payment_requests_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_requests" ADD CONSTRAINT "payment_requests_studio_id_fkey" FOREIGN KEY ("studio_id") REFERENCES "studios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
