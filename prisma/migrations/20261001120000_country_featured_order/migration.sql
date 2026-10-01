-- featured (نعم/لا) يصبح featuredOrder (رقم الترتيب في «أبرز الوجهات»، والفارغ يعني غير مميزة).

-- AlterTable
ALTER TABLE "Country" ADD COLUMN "featuredOrder" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Country_featuredOrder_key" ON "Country"("featuredOrder");

-- البيانات: الترتيب المعتمد. سكربت البذر لا يعدّل الدول الموجودة، فيُضبط هنا للقواعد المعبّأة سابقاً،
-- والقيم نفسها في data/countries.json لأي قاعدة جديدة.
UPDATE "Country" AS c SET "featuredOrder" = o."position"
FROM (VALUES
  ('georgia', 1),
  ('turkey', 2),
  ('azerbaijan', 3),
  ('malaysia', 4),
  ('thailand', 5),
  ('maldives', 6),
  ('egypt', 7),
  ('jordan', 8)
) AS o("slug", "position")
WHERE c."slug" = o."slug" AND c."featured" = true;

-- DropIndex
DROP INDEX "Country_featured_idx";

-- AlterTable
ALTER TABLE "Country" DROP COLUMN "featured";
