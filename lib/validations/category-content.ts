import { z } from "zod";

export const categoryContentSchema = z.object({
  categoryName: z
    .string()
    .trim()
    .min(1, "Nama kategori wajib diisi.")
    .max(80, "Nama kategori maksimal 80 karakter."),
});

export type CategoryContentFormValues = z.infer<typeof categoryContentSchema>;
