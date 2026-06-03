"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  contentPostSchema,
  type ContentPostFormValues,
} from "@/lib/validations/content-post";

export async function createContentPostAction(values: ContentPostFormValues) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return {
      ok: false,
      message: "Session tidak valid. Silakan login ulang.",
    };
  }

  const parsed = contentPostSchema.safeParse(values);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Data konten belum valid.",
    };
  }

  const data = parsed.data;

  await prisma.contentPost.create({
    data: {
      title: data.title,
      body: data.content,
      hook: data.hook || null,
      cta: data.cta || null,
      affiliateUrl: data.affiliateUrl || null,
      mediaUrls: data.mediaUrls ?? [],
      contentType: data.contentType,
      platform: data.platform,
      affiliateType: data.affiliateType || null,
    },
  });

  revalidatePath("/dashboard");

  return {
    ok: true,
    message: "Konten berhasil dibuat.",
  };
}
