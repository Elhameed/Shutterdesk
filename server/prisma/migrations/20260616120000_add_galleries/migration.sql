-- CreateEnum
CREATE TYPE "GalleryCategory" AS ENUM ('wedding', 'portrait', 'graduation', 'commercial');

-- CreateEnum
CREATE TYPE "GalleryStatus" AS ENUM ('published', 'draft', 'archived');

-- CreateEnum
CREATE TYPE "GalleryWorkflowStatus" AS ENUM ('delivered', 'ready', 'editing');

-- CreateTable
CREATE TABLE "galleries" (
    "id" TEXT NOT NULL,
    "studio_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "GalleryCategory" NOT NULL,
    "status" "GalleryStatus" NOT NULL DEFAULT 'draft',
    "workflow_status" "GalleryWorkflowStatus" NOT NULL DEFAULT 'editing',
    "cover_asset_key" TEXT,
    "photo_count" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "client_name" TEXT NOT NULL,
    "client_email" TEXT NOT NULL,
    "storage_used_gb" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "storage_total_gb" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "shoot_date" TEXT,
    "location" TEXT,
    "settings" JSONB,
    "delivery" JSONB,
    "analytics" JSONB,
    "activities" JSONB,
    "is_new" BOOLEAN NOT NULL DEFAULT false,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "galleries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gallery_photos" (
    "id" TEXT NOT NULL,
    "gallery_id" TEXT NOT NULL,
    "asset_key" TEXT NOT NULL,
    "thumbnail_asset_key" TEXT,
    "alt" TEXT NOT NULL DEFAULT '',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gallery_photos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bookings_gallery_id_key" ON "bookings"("gallery_id");

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_gallery_id_fkey" FOREIGN KEY ("gallery_id") REFERENCES "galleries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "galleries" ADD CONSTRAINT "galleries_studio_id_fkey" FOREIGN KEY ("studio_id") REFERENCES "studios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "galleries" ADD CONSTRAINT "galleries_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gallery_photos" ADD CONSTRAINT "gallery_photos_gallery_id_fkey" FOREIGN KEY ("gallery_id") REFERENCES "galleries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
