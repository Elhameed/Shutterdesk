-- Token revocation support
ALTER TABLE "users" ADD COLUMN "token_version" INTEGER NOT NULL DEFAULT 0;

-- Composite indexes for hot query patterns
CREATE INDEX "bookings_studio_id_session_at_idx" ON "bookings"("studio_id", "session_at");
CREATE INDEX "bookings_studio_id_status_idx" ON "bookings"("studio_id", "status");
CREATE INDEX "bookings_client_user_id_idx" ON "bookings"("client_user_id");
CREATE INDEX "bookings_client_email_idx" ON "bookings"("client_email");
CREATE INDEX "galleries_client_user_id_idx" ON "galleries"("client_user_id");
CREATE INDEX "galleries_studio_id_client_id_idx" ON "galleries"("studio_id", "client_id");
CREATE INDEX "payment_records_studio_id_paid_at_idx" ON "payment_records"("studio_id", "paid_at");
CREATE INDEX "payment_verifications_studio_id_status_idx" ON "payment_verifications"("studio_id", "status");
CREATE INDEX "notifications_user_id_read_idx" ON "notifications"("user_id", "read");
CREATE INDEX "payment_requests_booking_id_status_idx" ON "payment_requests"("booking_id", "status");
CREATE INDEX "service_packages_studio_id_is_active_idx" ON "service_packages"("studio_id", "is_active");
CREATE INDEX "gallery_photos_gallery_id_sort_order_idx" ON "gallery_photos"("gallery_id", "sort_order");

-- FK for payment_records.payment_request_id
ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_payment_request_id_fkey" FOREIGN KEY ("payment_request_id") REFERENCES "payment_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
