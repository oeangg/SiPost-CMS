-- AlterTable
ALTER TABLE "PostMetric" ADD COLUMN IF NOT EXISTS "afiliateDailySumaryId" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PostMetric_afiliateDailySumaryId_idx" ON "PostMetric"("afiliateDailySumaryId");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'PostMetric_afiliateDailySumaryId_fkey'
  ) THEN
    ALTER TABLE "PostMetric" ADD CONSTRAINT "PostMetric_afiliateDailySumaryId_fkey" FOREIGN KEY ("afiliateDailySumaryId") REFERENCES "AfiliateDailySumary"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
