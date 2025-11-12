/*
  Warnings:

  - You are about to drop the column `dayOfWeek` on the `professional_availability` table. All the data in the column will be lost.
  - Added the required column `dayIndex` to the `professional_availability` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."professional_availability_professionalId_dayOfWeek_idx";

-- AlterTable
ALTER TABLE "professional_availability" DROP COLUMN "dayOfWeek",
ADD COLUMN     "breakSlots" JSONB,
ADD COLUMN     "dayIndex" INTEGER NOT NULL,
ADD COLUMN     "isFullDayOff" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "ProfessionalAvailabilityException" (
    "_id" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "reason" TEXT,
    "startTime" TEXT,
    "endTime" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfessionalAvailabilityException_pkey" PRIMARY KEY ("_id")
);

-- CreateIndex
CREATE INDEX "ProfessionalAvailabilityException_date_idx" ON "ProfessionalAvailabilityException"("date");

-- CreateIndex
CREATE UNIQUE INDEX "ProfessionalAvailabilityException_professionalId_date_key" ON "ProfessionalAvailabilityException"("professionalId", "date");

-- CreateIndex
CREATE INDEX "professional_availability_professionalId_dayIndex_idx" ON "professional_availability"("professionalId", "dayIndex");

-- AddForeignKey
ALTER TABLE "ProfessionalAvailabilityException" ADD CONSTRAINT "ProfessionalAvailabilityException_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "professional"("_id") ON DELETE CASCADE ON UPDATE CASCADE;
