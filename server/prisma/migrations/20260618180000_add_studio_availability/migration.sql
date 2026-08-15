-- AlterTable
ALTER TABLE "bookings" ADD COLUMN "session_end_at" TIMESTAMP(3),
ADD COLUMN "duration_minutes" INTEGER NOT NULL DEFAULT 60;

-- CreateTable
CREATE TABLE "studio_schedules" (
    "id" TEXT NOT NULL,
    "studio_id" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Africa/Kigali',
    "weekly_rules" JSONB NOT NULL,
    "slot_interval_minutes" INTEGER NOT NULL DEFAULT 30,
    "buffer_minutes" INTEGER NOT NULL DEFAULT 15,
    "min_notice_hours" INTEGER NOT NULL DEFAULT 24,
    "max_days_ahead" INTEGER NOT NULL DEFAULT 60,
    "max_sessions_per_day" INTEGER NOT NULL DEFAULT 3,
    "require_approval" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "studio_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "availability_blocks" (
    "id" TEXT NOT NULL,
    "studio_id" TEXT NOT NULL,
    "starts_at" TIMESTAMP(3) NOT NULL,
    "ends_at" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "availability_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "studio_schedules_studio_id_key" ON "studio_schedules"("studio_id");

-- CreateIndex
CREATE INDEX "availability_blocks_studio_id_starts_at_ends_at_idx" ON "availability_blocks"("studio_id", "starts_at", "ends_at");

-- AddForeignKey
ALTER TABLE "studio_schedules" ADD CONSTRAINT "studio_schedules_studio_id_fkey" FOREIGN KEY ("studio_id") REFERENCES "studios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availability_blocks" ADD CONSTRAINT "availability_blocks_studio_id_fkey" FOREIGN KEY ("studio_id") REFERENCES "studios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
