-- CreateTable
CREATE TABLE "service_packages" (
    "id" TEXT NOT NULL,
    "studio_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "price" INTEGER NOT NULL,
    "deposit_percent" INTEGER NOT NULL DEFAULT 50,
    "category" "ClientCategory" NOT NULL,
    "duration" TEXT NOT NULL DEFAULT '1hr',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "cover_asset_key" TEXT,
    "metadata" JSONB,
    "total_revenue" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_packages_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "service_packages" ADD CONSTRAINT "service_packages_studio_id_fkey" FOREIGN KEY ("studio_id") REFERENCES "studios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
