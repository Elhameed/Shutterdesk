-- CreateEnum
CREATE TYPE "ClientTier" AS ENUM ('vip', 'active', 'new');

-- CreateEnum
CREATE TYPE "ClientCategory" AS ENUM ('wedding', 'commercial', 'portrait', 'editorial');

-- CreateTable
CREATE TABLE "studios" (
    "id" TEXT NOT NULL,
    "owner_user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "avatar_asset_key" TEXT,
    "payment_profile" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "studios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "studio_id" TEXT NOT NULL,
    "linked_user_id" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "category" "ClientCategory" NOT NULL,
    "tier" "ClientTier" NOT NULL DEFAULT 'new',
    "avatar_asset_key" TEXT,
    "banner_asset_key" TEXT,
    "location" TEXT,
    "internal_notes" TEXT,
    "sessions" INTEGER NOT NULL DEFAULT 0,
    "revenue" INTEGER NOT NULL DEFAULT 0,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "reliability" INTEGER NOT NULL DEFAULT 100,
    "rating" TEXT NOT NULL DEFAULT 'good',
    "member_since" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_booking_at" TIMESTAMP(3),
    "preferences" JSONB,
    "insights" JSONB,
    "timeline" JSONB,
    "projects" JSONB,
    "invoices" JSONB,
    "galleries" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "studios_owner_user_id_key" ON "studios"("owner_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "studios_slug_key" ON "studios"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "clients_linked_user_id_key" ON "clients"("linked_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "clients_studio_id_email_key" ON "clients"("studio_id", "email");

-- AddForeignKey
ALTER TABLE "studios" ADD CONSTRAINT "studios_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_studio_id_fkey" FOREIGN KEY ("studio_id") REFERENCES "studios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_linked_user_id_fkey" FOREIGN KEY ("linked_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
