import { z } from "zod";

export const contentTypes = [
  "TRAVELLING_LAUT",
  "TRAVELLING_GUNUNG",
  "SOFT_SELLING",
  "HARD_SELLING",
  "STORYTELLING",
  "PERSIB",
  "LAINNYA",
] as const;

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
  "SCHEDULED",
  "PUBLISHED",
  "ARCHIVED",
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
  contentType: z.enum(contentTypes),
  platform: z.enum(platforms),
  affiliateType: z.enum(affiliateTypes).optional().nullable().or(z.literal("")),
});

export type ContentPostFormValues = z.infer<typeof contentPostSchema>;
