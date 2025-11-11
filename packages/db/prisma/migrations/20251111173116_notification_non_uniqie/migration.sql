-- DropIndex
DROP INDEX "public"."notification_userId_type_key";

-- CreateIndex
CREATE INDEX "notification_userId_type_idx" ON "notification"("userId", "type");
