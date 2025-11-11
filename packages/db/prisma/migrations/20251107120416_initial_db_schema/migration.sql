-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'PROFESSIONAL', 'ADMIN');

-- CreateEnum
CREATE TYPE "BookingType" AS ENUM ('IMMEDIATE', 'SCHEDULED');

-- CreateEnum
CREATE TYPE "RecurrenceFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "RecurrenceStatus" AS ENUM ('ACTIVE', 'PAUSED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'EN_ROUTE', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('SENT', 'READ', 'RESPONDED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "NotificationResponse" AS ENUM ('ACCEPTED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('PUSH', 'SMS', 'EMAIL', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "EarningSourceType" AS ENUM ('BOOKING', 'TIP', 'BONUS', 'ADJUSTMENT', 'REFUND_REVERSAL');

-- CreateEnum
CREATE TYPE "EarningStatus" AS ENUM ('PENDING', 'IN_PAYOUT', 'PAID', 'REVERSED');

-- CreateEnum
CREATE TYPE "PayoutType" AS ENUM ('AUTO', 'MANUAL', 'ADHOC');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'PAID', 'FAILED', 'REVERSED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('BOOKING_CREATED', 'BOOKING_CONFIRMED', 'BOOKING_STARTED', 'BOOKING_COMPLETED', 'BOOKING_CANCELLED', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'PROFESSIONAL_ASSIGNED', 'REVIEW_RECEIVED', 'PAYOUT_PROCESSED', 'GENERAL');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CARD', 'UPI', 'WALLET', 'NET_BANKING');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('NONE', 'REQUESTED', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('INITIATED', 'SUCCESS', 'FAILED', 'PENDING');

-- CreateEnum
CREATE TYPE "PaymentTransactionType" AS ENUM ('INTENT_CREATED', 'AUTHORIZED', 'CAPTURED', 'REFUND_INITIATED', 'REFUND_COMPLETED', 'PAYOUT_INITIATED', 'PAYOUT_COMPLETED');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('AADHAAR', 'PAN', 'POLICE_VERIFICATION', 'REFERENCE_LETTER', 'CERTIFICATE');

-- CreateEnum
CREATE TYPE "ServiceCategory" AS ENUM ('CLEANING', 'COOKING', 'PLUMBING', 'ELECTRICAL', 'OTHER');

-- CreateTable
CREATE TABLE "pricing_config" (
    "id" TEXT NOT NULL,
    "configKey" TEXT NOT NULL,
    "configValue" JSONB NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "effectiveFrom" TIMESTAMP(3),
    "effectiveTo" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cancellation_policies" (
    "id" TEXT NOT NULL,
    "hoursBeforeBooking" INTEGER NOT NULL,
    "refundPercentage" DECIMAL(5,2) NOT NULL,
    "description" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cancellation_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_config" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "session" (
    "_id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "account" (
    "_id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "verification" (
    "_id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "verification_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "booking" (
    "_id" TEXT NOT NULL,
    "bookingCode" TEXT NOT NULL,
    "bookingCodeVerifiedAt" TIMESTAMP(3),
    "customerId" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "addressId" TEXT NOT NULL,
    "bookingType" "BookingType" NOT NULL DEFAULT 'SCHEDULED',
    "scheduledStartTime" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "subTotal" DECIMAL(12,2) NOT NULL,
    "surgeMultiplier" DECIMAL(4,2) NOT NULL DEFAULT 1.0,
    "platformFee" DECIMAL(12,2) NOT NULL,
    "discountAmount" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "cancellationReason" TEXT,
    "cancelledBy" "UserRole",
    "cancelledById" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "specialInstructions" TEXT,
    "rescheduledFromId" TEXT,
    "rescheduledAt" TIMESTAMP(3),
    "rescheduledBy" "UserRole",
    "rescheduledById" TEXT,
    "recurringBookingRuleId" TEXT,
    "autoGenerated" BOOLEAN NOT NULL DEFAULT false,
    "parentBookingId" TEXT,
    "recurringIndex" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "recurring_booking_rule" (
    "_id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "addressId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "frequency" "RecurrenceFrequency" NOT NULL,
    "interval" INTEGER NOT NULL DEFAULT 1,
    "daysOfWeek" "DayOfWeek"[],
    "status" "RecurrenceStatus" NOT NULL DEFAULT 'ACTIVE',
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "lastGeneratedAt" TIMESTAMP(3),
    "nextCheckAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lookAheadCount" INTEGER NOT NULL DEFAULT 4,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recurring_booking_rule_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "booking_item" (
    "_id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "hours" DECIMAL(6,2) NOT NULL,
    "rate" DECIMAL(12,2) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "booking_item_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "booking_notification" (
    "_id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'SENT',
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "response" "NotificationResponse",
    "responseTimeMs" INTEGER,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "attempt" INTEGER NOT NULL DEFAULT 1,
    "errorMessage" TEXT,

    CONSTRAINT "booking_notification_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "_id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "customer_address" (
    "_id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "landmark" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "location" geography(Point, 4326),
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_address_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "favorite_professional" (
    "_id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_professional_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "earnings" (
    "_id" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "bookingId" TEXT,
    "paymentId" TEXT,
    "payoutId" TEXT,
    "earningSourceType" "EarningSourceType" NOT NULL DEFAULT 'BOOKING',
    "sourceRef" TEXT,
    "grossAmount" DECIMAL(12,2) NOT NULL,
    "platformCommission" DECIMAL(12,2) NOT NULL,
    "taxes" DECIMAL(12,2),
    "netAmount" DECIMAL(12,2) NOT NULL,
    "isReversed" BOOLEAN NOT NULL DEFAULT false,
    "reversedAt" TIMESTAMP(3),
    "reversalReason" TEXT,
    "earningStatus" "EarningStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "earnings_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "payouts" (
    "_id" TEXT NOT NULL,
    "referenceCode" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "paymentGateway" TEXT,
    "type" "PayoutType" NOT NULL DEFAULT 'AUTO',
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "totalEarnings" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalCommission" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "taxesDeducted" DECIMAL(12,2) DEFAULT 0,
    "payoutAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "initiatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "settledAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "externalPayoutRef" TEXT,
    "bankAccountDetails" JSONB,
    "notes" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payouts_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "notification" (
    "_id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "data" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "payment" (
    "_id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "paymentMethod" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "transactionId" TEXT,
    "paymentGateway" TEXT,
    "gatewayFee" DECIMAL(10,2),
    "platformCommission" DECIMAL(10,2),
    "netAmount" DECIMAL(12,2),
    "refundedAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "initiatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "capturedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "refundStatus" "RefundStatus" DEFAULT 'NONE',
    "metadata" JSONB,
    "refundReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "payment_transaction" (
    "_id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "transactionType" "PaymentTransactionType" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "TransactionStatus" NOT NULL DEFAULT 'INITIATED',
    "transactionReference" TEXT,
    "rawResponse" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_transaction_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "professional" (
    "_id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "maskedAadhaar" TEXT NOT NULL,
    "isAadhaarVerified" BOOLEAN NOT NULL DEFAULT false,
    "aadhaarVerifiedAt" TIMESTAMP(3),
    "dateOfBirth" TIMESTAMP(3),
    "gender" "Gender",
    "profileImage" TEXT,
    "bio" TEXT,
    "experienceYears" INTEGER,
    "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "serviceRadiusKm" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "baseLatitude" DOUBLE PRECISION,
    "baseLongitude" DOUBLE PRECISION,
    "baseLocation" geography(Point, 4326),
    "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "totalBookings" INTEGER NOT NULL DEFAULT 0,
    "completedBookings" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),

    CONSTRAINT "professional_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "professional_document" (
    "_id" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "documentUrl" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "professional_document_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "professional_service" (
    "_id" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "hourlyRate" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "professional_service_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "professional_availability" (
    "_id" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "professional_availability_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "review" (
    "_id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "service" (
    "_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "iconUrl" TEXT,
    "baseHourlyRate" DECIMAL(10,2) NOT NULL,
    "minimumHours" INTEGER NOT NULL DEFAULT 1,
    "category" "ServiceCategory" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_pkey" PRIMARY KEY ("_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pricing_config_configKey_key" ON "pricing_config"("configKey");

-- CreateIndex
CREATE UNIQUE INDEX "system_config_key_key" ON "system_config"("key");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "booking_customerId_idx" ON "booking"("customerId");

-- CreateIndex
CREATE INDEX "booking_professionalId_idx" ON "booking"("professionalId");

-- CreateIndex
CREATE INDEX "booking_status_idx" ON "booking"("status");

-- CreateIndex
CREATE INDEX "booking_scheduledStartTime_idx" ON "booking"("scheduledStartTime");

-- CreateIndex
CREATE INDEX "booking_item_bookingId_idx" ON "booking_item"("bookingId");

-- CreateIndex
CREATE INDEX "booking_item_serviceId_idx" ON "booking_item"("serviceId");

-- CreateIndex
CREATE INDEX "booking_notification_bookingId_idx" ON "booking_notification"("bookingId");

-- CreateIndex
CREATE INDEX "booking_notification_professionalId_status_idx" ON "booking_notification"("professionalId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_userId_key" ON "Customer"("userId");

-- CreateIndex
CREATE INDEX "customer_address_customerId_idx" ON "customer_address"("customerId");

-- CreateIndex
CREATE INDEX "customer_address_location_idx" ON "customer_address" USING GIST ("location");

-- CreateIndex
CREATE UNIQUE INDEX "favorite_professional_customerId_professionalId_key" ON "favorite_professional"("customerId", "professionalId");

-- CreateIndex
CREATE INDEX "earnings_professionalId_idx" ON "earnings"("professionalId");

-- CreateIndex
CREATE INDEX "earnings_payoutId_idx" ON "earnings"("payoutId");

-- CreateIndex
CREATE UNIQUE INDEX "payouts_referenceCode_key" ON "payouts"("referenceCode");

-- CreateIndex
CREATE INDEX "payouts_professionalId_idx" ON "payouts"("professionalId");

-- CreateIndex
CREATE INDEX "notification_userId_isRead_idx" ON "notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "notification_createdAt_idx" ON "notification"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "notification_userId_type_key" ON "notification"("userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "payment_bookingId_key" ON "payment"("bookingId");

-- CreateIndex
CREATE INDEX "payment_bookingId_idx" ON "payment"("bookingId");

-- CreateIndex
CREATE INDEX "payment_customerId_idx" ON "payment"("customerId");

-- CreateIndex
CREATE INDEX "payment_transaction_paymentId_idx" ON "payment_transaction"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "professional_userId_key" ON "professional"("userId");

-- CreateIndex
CREATE INDEX "professional_userId_idx" ON "professional"("userId");

-- CreateIndex
CREATE INDEX "professional_isAvailable_approvalStatus_idx" ON "professional"("isAvailable", "approvalStatus");

-- CreateIndex
CREATE INDEX "professional_baseLocation_idx" ON "professional" USING GIST ("baseLocation");

-- CreateIndex
CREATE INDEX "professional_document_professionalId_idx" ON "professional_document"("professionalId");

-- CreateIndex
CREATE UNIQUE INDEX "professional_document_professionalId_documentType_key" ON "professional_document"("professionalId", "documentType");

-- CreateIndex
CREATE INDEX "professional_service_professionalId_idx" ON "professional_service"("professionalId");

-- CreateIndex
CREATE INDEX "professional_service_serviceId_idx" ON "professional_service"("serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "professional_service_professionalId_serviceId_key" ON "professional_service"("professionalId", "serviceId");

-- CreateIndex
CREATE INDEX "professional_availability_professionalId_idx" ON "professional_availability"("professionalId");

-- CreateIndex
CREATE INDEX "professional_availability_professionalId_dayOfWeek_idx" ON "professional_availability"("professionalId", "dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "review_bookingId_key" ON "review"("bookingId");

-- CreateIndex
CREATE INDEX "review_customerId_idx" ON "review"("customerId");

-- CreateIndex
CREATE INDEX "review_professionalId_idx" ON "review"("professionalId");

-- CreateIndex
CREATE INDEX "review_bookingId_idx" ON "review"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "service_name_key" ON "service"("name");

-- CreateIndex
CREATE UNIQUE INDEX "service_slug_key" ON "service"("slug");

-- CreateIndex
CREATE INDEX "service_slug_idx" ON "service"("slug");

-- CreateIndex
CREATE INDEX "service_category_idx" ON "service"("category");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "professional"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "customer_address"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_recurringBookingRuleId_fkey" FOREIGN KEY ("recurringBookingRuleId") REFERENCES "recurring_booking_rule"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_booking_rule" ADD CONSTRAINT "recurring_booking_rule_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_booking_rule" ADD CONSTRAINT "recurring_booking_rule_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "professional"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_booking_rule" ADD CONSTRAINT "recurring_booking_rule_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "service"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_booking_rule" ADD CONSTRAINT "recurring_booking_rule_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "customer_address"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_item" ADD CONSTRAINT "booking_item_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "booking"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_item" ADD CONSTRAINT "booking_item_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "service"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_notification" ADD CONSTRAINT "booking_notification_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "booking"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_notification" ADD CONSTRAINT "booking_notification_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "professional"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_address" ADD CONSTRAINT "customer_address_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_professional" ADD CONSTRAINT "favorite_professional_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_professional" ADD CONSTRAINT "favorite_professional_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "professional"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "earnings" ADD CONSTRAINT "earnings_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "professional"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "earnings" ADD CONSTRAINT "earnings_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payment"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "earnings" ADD CONSTRAINT "earnings_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "payouts"("_id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "earnings" ADD CONSTRAINT "earnings_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "booking"("_id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "professional"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "booking"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transaction" ADD CONSTRAINT "payment_transaction_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payment"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professional" ADD CONSTRAINT "professional_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professional_document" ADD CONSTRAINT "professional_document_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "professional"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professional_service" ADD CONSTRAINT "professional_service_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "professional"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professional_service" ADD CONSTRAINT "professional_service_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "service"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professional_availability" ADD CONSTRAINT "professional_availability_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "professional"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "professional"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "booking"("_id") ON DELETE CASCADE ON UPDATE CASCADE;
