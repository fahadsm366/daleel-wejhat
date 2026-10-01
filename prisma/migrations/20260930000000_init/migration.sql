-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "EntryType" AS ENUM ('gcc', 'visa_free', 'eta', 'visa_on_arrival', 'evisa_or_voa', 'evisa', 'visa_required');

-- CreateEnum
CREATE TYPE "Audience" AS ENUM ('saudi_citizen', 'resident');

-- CreateEnum
CREATE TYPE "Region" AS ENUM ('gulf', 'middle_east', 'africa', 'europe', 'asia', 'north_central_america', 'caribbean', 'south_america', 'oceania');

-- CreateEnum
CREATE TYPE "InsuranceRequirement" AS ENUM ('mandatory_for_visa', 'required_on_entry_verify', 'recommended');

-- CreateEnum
CREATE TYPE "ProhibitionCategory" AS ENUM ('medicine', 'devices', 'food', 'cash', 'other');

-- CreateEnum
CREATE TYPE "ProhibitionSeverity" AS ENUM ('prohibited', 'permit_required', 'declare');

-- CreateEnum
CREATE TYPE "PolicyTopic" AS ENUM ('registration', 'driving', 'conduct', 'work', 'money', 'telecom', 'emergency');

-- CreateEnum
CREATE TYPE "PolicySeverity" AS ENUM ('criminal', 'fine', 'notice');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('traveler', 'office', 'admin');

-- CreateEnum
CREATE TYPE "OfficeKind" AS ENUM ('visa', 'travel', 'insurance');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('draft', 'submitted', 'offers_received', 'offer_accepted', 'paid', 'in_progress', 'completed', 'rejected_by_embassy', 'cancelled', 'refunded');

-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('pending', 'accepted', 'declined', 'expired', 'withdrawn');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'captured', 'refunded', 'failed');

-- CreateEnum
CREATE TYPE "ReviewOutcome" AS ENUM ('approved', 'rejected');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('pending', 'published', 'hidden');

-- CreateEnum
CREATE TYPE "DocumentKind" AS ENUM ('passport', 'residence_permit', 'photo', 'other');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('create', 'update', 'delete');

-- CreateTable
CREATE TABLE "Country" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "region" "Region" NOT NULL,
    "arabCountry" BOOLEAN NOT NULL DEFAULT false,
    "schengen" BOOLEAN NOT NULL DEFAULT false,
    "travelAdvisory" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntryRule" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "audience" "Audience" NOT NULL,
    "nationality" TEXT NOT NULL,
    "entryType" "EntryType" NOT NULL,
    "stay" TEXT,
    "notes" TEXT,
    "fees" TEXT,
    "vaccination" TEXT,
    "insurance" "InsuranceRequirement" NOT NULL,
    "residencyMinMonths" INTEGER,
    "professions" TEXT[],
    "needsVerification" BOOLEAN NOT NULL DEFAULT false,
    "validUntil" DATE,
    "entryTypeAfter" "EntryType",
    "sourceName" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "verifiedAt" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EntryRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prohibition" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "category" "ProhibitionCategory" NOT NULL,
    "item" TEXT NOT NULL,
    "severity" "ProhibitionSeverity" NOT NULL,
    "details" TEXT,
    "sourceUrl" TEXT NOT NULL,
    "verifiedAt" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prohibition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocalPolicy" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "topic" "PolicyTopic" NOT NULL,
    "title" TEXT NOT NULL,
    "severity" "PolicySeverity" NOT NULL,
    "details" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "verifiedAt" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocalPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "name" TEXT,
    "role" "Role" NOT NULL DEFAULT 'traveler',
    "officeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Office" (
    "id" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "kind" "OfficeKind" NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "licenseVerified" BOOLEAN NOT NULL DEFAULT false,
    "commissionRate" DECIMAL(5,4),
    "payoutAccountId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Office_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfficeCountry" (
    "officeId" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,

    CONSTRAINT "OfficeCountry_pkey" PRIMARY KEY ("officeId","countryId")
);

-- CreateTable
CREATE TABLE "VisaRequest" (
    "id" TEXT NOT NULL,
    "travelerId" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "visaType" TEXT NOT NULL,
    "travelDate" DATE NOT NULL,
    "travelers" INTEGER NOT NULL,
    "nationality" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'draft',
    "acceptedOfferId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisaRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "officeId" TEXT NOT NULL,
    "priceHalalas" INTEGER NOT NULL,
    "commissionRate" DECIMAL(5,4) NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "includes" TEXT NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "status" "OfferStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "gatewayRef" TEXT NOT NULL,
    "amountHalalas" INTEGER NOT NULL,
    "commissionHalalas" INTEGER NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "invoiceNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "capturedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "officeId" TEXT NOT NULL,
    "travelerId" TEXT NOT NULL,
    "speed" INTEGER NOT NULL,
    "priceKept" INTEGER NOT NULL,
    "communication" INTEGER NOT NULL,
    "outcome" "ReviewOutcome" NOT NULL,
    "text" TEXT,
    "officeReply" TEXT,
    "officeReplyAt" TIMESTAMP(3),
    "status" "ReviewStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "officeId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "kind" "DocumentKind" NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleteAfter" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Country_slug_key" ON "Country"("slug");

-- CreateIndex
CREATE INDEX "Country_region_idx" ON "Country"("region");

-- CreateIndex
CREATE INDEX "EntryRule_entryType_idx" ON "EntryRule"("entryType");

-- CreateIndex
CREATE INDEX "EntryRule_validUntil_idx" ON "EntryRule"("validUntil");

-- CreateIndex
CREATE UNIQUE INDEX "EntryRule_countryId_audience_nationality_key" ON "EntryRule"("countryId", "audience", "nationality");

-- CreateIndex
CREATE INDEX "Prohibition_countryId_idx" ON "Prohibition"("countryId");

-- CreateIndex
CREATE INDEX "LocalPolicy_countryId_idx" ON "LocalPolicy"("countryId");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE INDEX "User_officeId_idx" ON "User"("officeId");

-- CreateIndex
CREATE UNIQUE INDEX "Office_licenseNumber_key" ON "Office"("licenseNumber");

-- CreateIndex
CREATE INDEX "OfficeCountry_countryId_idx" ON "OfficeCountry"("countryId");

-- CreateIndex
CREATE UNIQUE INDEX "VisaRequest_acceptedOfferId_key" ON "VisaRequest"("acceptedOfferId");

-- CreateIndex
CREATE INDEX "VisaRequest_travelerId_idx" ON "VisaRequest"("travelerId");

-- CreateIndex
CREATE INDEX "VisaRequest_countryId_idx" ON "VisaRequest"("countryId");

-- CreateIndex
CREATE INDEX "VisaRequest_status_idx" ON "VisaRequest"("status");

-- CreateIndex
CREATE INDEX "Offer_officeId_idx" ON "Offer"("officeId");

-- CreateIndex
CREATE UNIQUE INDEX "Offer_requestId_officeId_key" ON "Offer"("requestId", "officeId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_requestId_key" ON "Payment"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_offerId_key" ON "Payment"("offerId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_gatewayRef_key" ON "Payment"("gatewayRef");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_invoiceNumber_key" ON "Payment"("invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Review_requestId_key" ON "Review"("requestId");

-- CreateIndex
CREATE INDEX "Review_officeId_status_idx" ON "Review"("officeId", "status");

-- CreateIndex
CREATE INDEX "Message_requestId_officeId_createdAt_idx" ON "Message"("requestId", "officeId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Document_storageKey_key" ON "Document"("storageKey");

-- CreateIndex
CREATE INDEX "Document_requestId_idx" ON "Document"("requestId");

-- CreateIndex
CREATE INDEX "Document_deleteAfter_idx" ON "Document"("deleteAfter");

-- CreateIndex
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "EntryRule" ADD CONSTRAINT "EntryRule_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prohibition" ADD CONSTRAINT "Prohibition_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalPolicy" ADD CONSTRAINT "LocalPolicy_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficeCountry" ADD CONSTRAINT "OfficeCountry_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficeCountry" ADD CONSTRAINT "OfficeCountry_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisaRequest" ADD CONSTRAINT "VisaRequest_travelerId_fkey" FOREIGN KEY ("travelerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisaRequest" ADD CONSTRAINT "VisaRequest_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisaRequest" ADD CONSTRAINT "VisaRequest_acceptedOfferId_fkey" FOREIGN KEY ("acceptedOfferId") REFERENCES "Offer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "VisaRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "VisaRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "VisaRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_travelerId_fkey" FOREIGN KEY ("travelerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "VisaRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "VisaRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ─────────────────────────────────────────────────────────────
-- قيود CHECK مضافة يدوياً (Prisma لا يعبّر عنها في schema.prisma).
-- تحمي المال والتقييم والجنسية على مستوى قاعدة البيانات نفسها.
-- ─────────────────────────────────────────────────────────────

-- الجنسية رمز ISO من حرفين كبيرين، والمواطن السعودي = SA
ALTER TABLE "EntryRule" ADD CONSTRAINT "EntryRule_nationality_iso_check"
  CHECK ("nationality" ~ '^[A-Z]{2}$');
ALTER TABLE "EntryRule" ADD CONSTRAINT "EntryRule_citizen_is_sa_check"
  CHECK ("audience" <> 'saudi_citizen' OR "nationality" = 'SA');
-- الحالة اللاحقة لا معنى لها دون تاريخ انتهاء
ALTER TABLE "EntryRule" ADD CONSTRAINT "EntryRule_after_needs_until_check"
  CHECK ("entryTypeAfter" IS NULL OR "validUntil" IS NOT NULL);
ALTER TABLE "EntryRule" ADD CONSTRAINT "EntryRule_residency_months_check"
  CHECK ("residencyMinMonths" IS NULL OR "residencyMinMonths" >= 0);

-- نسبة العمولة بين 0 و 1
ALTER TABLE "Office" ADD CONSTRAINT "Office_commission_rate_check"
  CHECK ("commissionRate" IS NULL OR ("commissionRate" >= 0 AND "commissionRate" <= 1));

ALTER TABLE "VisaRequest" ADD CONSTRAINT "VisaRequest_travelers_check"
  CHECK ("travelers" >= 1);
ALTER TABLE "VisaRequest" ADD CONSTRAINT "VisaRequest_nationality_iso_check"
  CHECK ("nationality" ~ '^[A-Z]{2}$');

-- العرض: سعر موجب بالهللات، مدة موجبة، نسبة بين 0 و 1
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_price_check"
  CHECK ("priceHalalas" > 0);
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_duration_check"
  CHECK ("durationDays" > 0);
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_commission_rate_check"
  CHECK ("commissionRate" >= 0 AND "commissionRate" <= 1);

-- الدفع: مبلغ موجب، عمولة غير سالبة ولا تتجاوز المبلغ
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_amount_check"
  CHECK ("amountHalalas" > 0);
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_commission_check"
  CHECK ("commissionHalalas" >= 0 AND "commissionHalalas" <= "amountHalalas");

-- التقييم من 1 إلى 5، ورد المكتب ووقته يأتيان معاً
ALTER TABLE "Review" ADD CONSTRAINT "Review_scores_check"
  CHECK ("speed" BETWEEN 1 AND 5 AND "priceKept" BETWEEN 1 AND 5 AND "communication" BETWEEN 1 AND 5);
ALTER TABLE "Review" ADD CONSTRAINT "Review_reply_pair_check"
  CHECK (("officeReply" IS NULL) = ("officeReplyAt" IS NULL));

ALTER TABLE "Document" ADD CONSTRAINT "Document_size_check"
  CHECK ("sizeBytes" > 0);
