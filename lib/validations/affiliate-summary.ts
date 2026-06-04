import { z } from "zod";
import { affiliateTypes } from "@/lib/validations/content-post";

const nonNegativeInteger = z
  .number()
  .int("Harus berupa angka bulat.")
  .min(0, "Tidak boleh kurang dari 0.");

const nonNegativeNumber = z
  .number()
  .min(0, "Tidak boleh kurang dari 0.");

export const affiliateDailySummarySchema = z.object({
  summaryDate: z.string().min(1, "Tanggal wajib diisi."),
  affiliateType: z.enum(affiliateTypes),
  totalClicks: nonNegativeInteger,
  totalOrders: nonNegativeInteger,
  totalRevenue: nonNegativeNumber,
  notes: z.string().max(500, "Catatan maksimal 500 karakter.").optional(),
});

export type AffiliateDailySummaryFormValues = z.infer<
  typeof affiliateDailySummarySchema
>;
