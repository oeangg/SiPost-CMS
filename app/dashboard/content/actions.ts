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
  const userId = session.user.id;
  const category = await prisma.categoryContent.findFirst({
    where: {
      id: data.categoryId,
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!category) {
    return {
      ok: false,
      message: "Kategori konten tidak ditemukan.",
    };
  }

  await prisma.contentPost.create({
    data: {
      userId,
      body: data.content,
      hook: data.hook,
      cta: data.cta || null,
      affiliateUrl: data.affiliateUrl || null,
      categoryId: data.categoryId,
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
  const userId = session.user.id;
  const category = await prisma.categoryContent.findFirst({
    where: {
      id: data.categoryId,
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!category) {
    return {
      ok: false,
      message: "Kategori konten tidak ditemukan.",
    };
  }

  const result = await prisma.contentPost.updateMany({
    where: {
      id,
      userId,
    },
    data: {
      body: data.content,
      hook: data.hook,
      cta: data.cta || null,
      affiliateUrl: data.affiliateUrl || null,
      categoryId: data.categoryId,
      platform: data.platform,
      affiliateType: data.affiliateType || null,
    },
  });

  if (result.count === 0) {
    return {
      ok: false,
      message: "Konten tidak ditemukan.",
    };
  }

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

  const result = await prisma.contentPost.deleteMany({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (result.count === 0) {
    return {
      ok: false,
      message: "Konten tidak ditemukan.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/content");

  return {
    ok: true,
    message: "Konten berhasil dihapus.",
  };
}

export async function updateContentPostStatusAction(
  id: string,
  status: string,
  publishedAt?: string | null,
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

  if (!postStatuses.includes(status as (typeof postStatuses)[number])) {
    return {
      ok: false,
      message: "Status konten tidak valid.",
    };
  }

  const typedStatus = status as (typeof postStatuses)[number];
  let nextPublishedAt: Date | null = null;

  if (typedStatus === "PUBLISHED") {
    nextPublishedAt = new Date(publishedAt ?? "");

    if (Number.isNaN(nextPublishedAt.getTime())) {
      return {
        ok: false,
        message: "Tanggal publish tidak valid.",
      };
    }
  }

  const result = await prisma.contentPost.updateMany({
    where: {
      id,
      userId: session.user.id,
    },
    data: {
      status: typedStatus,
      publishedAt: nextPublishedAt,
    },
  });

  if (result.count === 0) {
    return {
      ok: false,
      message: "Konten tidak ditemukan.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/content");

  return {
    ok: true,
    message: "Status berhasil diperbarui.",
  };
}
