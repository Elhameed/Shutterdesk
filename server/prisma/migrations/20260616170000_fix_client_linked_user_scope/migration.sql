-- Allow one client user to link to multiple studios (marketplace model).
DROP INDEX IF EXISTS "clients_linked_user_id_key";

CREATE UNIQUE INDEX "clients_studio_id_linked_user_id_key"
  ON "clients"("studio_id", "linked_user_id");
