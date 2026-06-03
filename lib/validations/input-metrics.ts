import { z } from "zod";

const nonNegativeInteger = z
  .number()
  .int("Harus berupa angka bulat.")
  .min(0, "Tidak boleh kurang dari 0.");

export const postMetricSchema = z.object({
  contentPostId: z.string().min(1, "Konten wajib dipilih."),
  metricDate: z.string().min(1, "Tanggal wajib diisi."),
  views: nonNegativeInteger,
  likes: nonNegativeInteger,
  comments: nonNegativeInteger,
  shares: nonNegativeInteger,
  repost: nonNegativeInteger,
});

export type PostMetricFormValues = z.infer<typeof postMetricSchema>;
