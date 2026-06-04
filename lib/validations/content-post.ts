import { z } from "zod";

export const platforms = [
  "INSTAGRAM",
  "TIKTOK",
  "YOUTUBE",
  "FACEBOOK",
  "X",
  "THREADS",
  "WEBSITE",
  "LAINNYA",
] as const;

export const affiliateTypes = [
  "SHOPEE",
  "LAZADA",
  "TOKOPEDIA",
  "TIKTOK_SHOP",
  "LAINNYA",
] as const;

export const postStatuses = [
  "DRAFT",
  "PUBLISHED",
] as const;

export const contentPostSchema = z.object({
  hook: z.string().min(1, "Hook wajib diisi"),
  content: z.string().min(1, "Teks konten wajib diisi"),
  affiliateUrl: z
    .string()
    .url("URL affiliate tidak valid")
    .optional()
    .nullable()
    .or(z.literal("")),
  categoryId: z.string().min(1, "Kategori konten wajib dipilih"),
  platform: z.enum(platforms),
  affiliateType: z.enum(affiliateTypes).optional().nullable().or(z.literal("")),
});

export type ContentPostFormValues = z.infer<typeof contentPostSchema>;
