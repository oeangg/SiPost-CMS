"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  postMetricSchema,
  type PostMetricFormValues,
} from "@/lib/validations/input-metrics";

function parseDateInput(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

async function requireSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return Boolean(session);
}

export async function upsertPostMetricAction(values: PostMetricFormValues) {
  if (!(await requireSession())) {
    return {
      ok: false,
      message: "Session tidak valid. Silakan login ulang.",
    };
  }

  const parsed = postMetricSchema.safeParse(values);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Data metrik konten belum valid.",
    };
  }

  const metricDate = parseDateInput(parsed.data.metricDate);

  if (!metricDate) {
    return {
      ok: false,
      message: "Tanggal metrik tidak valid.",
    };
  }

  const contentExists = await prisma.contentPost.findUnique({
    where: {
      id: parsed.data.contentPostId,
    },
    select: {
      id: true,
    },
  });

  if (!contentExists) {
    return {
      ok: false,
      message: "Konten tidak ditemukan.",
    };
  }

  await prisma.postMetric.upsert({
    where: {
      contentPostId_metricDate: {
        contentPostId: parsed.data.contentPostId,
        metricDate,
      },
    },
    create: {
      contentPostId: parsed.data.contentPostId,
      metricDate,
      views: parsed.data.views,
      likes: parsed.data.likes,
      comments: parsed.data.comments,
      shares: parsed.data.shares,
      repost: parsed.data.repost,
    },
    update: {
      views: parsed.data.views,
      likes: parsed.data.likes,
      comments: parsed.data.comments,
      shares: parsed.data.shares,
      repost: parsed.data.repost,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/input-metrics");

  return {
    ok: true,
    message: "Metrik konten berhasil disimpan.",
  };
}
