-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "action_href" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "studios" ADD COLUMN "profile_settings" JSONB,
ADD COLUMN "brand_settings" JSONB,
ADD COLUMN "notification_prefs" JSONB,
ADD COLUMN "gallery_settings" JSONB,
ADD COLUMN "security_settings" JSONB,
ADD COLUMN "billing_settings" JSONB;

-- AlterTable
ALTER TABLE "users" ADD COLUMN "client_settings" JSONB;

-- Multi-studio marketplace (Phase 7+) booking links
ALTER TABLE "bookings" ADD COLUMN "client_user_id" TEXT,
ADD COLUMN "service_package_id" TEXT;

ALTER TABLE "galleries" ADD COLUMN "client_user_id" TEXT;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "bookings" ADD CONSTRAINT "bookings_client_user_id_fkey" FOREIGN KEY ("client_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_service_package_id_fkey" FOREIGN KEY ("service_package_id") REFERENCES "service_packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "galleries" ADD CONSTRAINT "galleries_client_user_id_fkey" FOREIGN KEY ("client_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
