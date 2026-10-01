-- AlterTable
ALTER TABLE "Country" ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Country_featured_idx" ON "Country"("featured");

-- البيانات: سكربت البذر لا يعدّل الدول الموجودة، فتُضبط هنا لقواعد البيانات المعبّأة سابقاً.
-- في قاعدة بيانات جديدة لا تطابق هذه الأوامر شيئاً، والقيم نفسها تأتي من data/countries.json.

-- أبرز الوجهات في الصفحة الرئيسية.
UPDATE "Country" SET "featured" = true
WHERE "slug" IN ('georgia', 'turkey', 'azerbaijan', 'malaysia', 'thailand', 'maldives', 'egypt', 'jordan');

-- الجبل الأسود: الإعفاء ينتهي 2026-10-31، وتُفرض التأشيرة على السعوديين من 1 نوفمبر 2026.
UPDATE "EntryRule" SET "validUntil" = DATE '2026-10-31', "entryTypeAfter" = 'visa_required'
WHERE "audience" = 'saudi_citizen' AND "nationality" = 'SA'
  AND "countryId" = (SELECT "id" FROM "Country" WHERE "slug" = 'montenegro')
  AND "validUntil" IS NULL;
