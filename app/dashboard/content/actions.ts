"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  contentPostSchema,
  postStatuses,
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

export async function updateContentPostAction(
  id: string,
  values: ContentPostFormValues,
) {
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

  await prisma.contentPost.update({
    where: {
      id,
    },
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
  revalidatePath("/dashboard/content");
  revalidatePath(`/dashboard/content/${id}/edit`);

  return {
    ok: true,
    message: "Konten berhasil diperbarui.",
  };
}

export async function deleteContentPostAction(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return {
      ok: false,
      message: "Session tidak valid. Silakan login ulang.",
    };
  }

  await prisma.contentPost.delete({
    where: {
      id,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/content");

  return {
    ok: true,
    message: "Konten berhasil dihapus.",
  };
}

export async function updateContentPostStatusAction(id: string, status: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return {
      ok: false,
      message: "Session tidak valid. Silakan login ulang.",
    };
  }

  if (!postStatuses.includes(status as (typeof postStatuses)[number])) {
    return {
      ok: false,
      message: "Status konten tidak valid.",
    };
  }

  await prisma.contentPost.update({
    where: {
      id,
    },
    data: {
      status: status as (typeof postStatuses)[number],
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/content");

  return {
    ok: true,
    message: "Status berhasil diperbarui.",
  };
}
