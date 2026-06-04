"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  affiliateDailySummarySchema,
  type AffiliateDailySummaryFormValues,
} from "@/lib/validations/affiliate-summary";

function parseDateInput(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function getNextDay(value: Date) {
  const nextDay = new Date(value);
  nextDay.setUTCDate(nextDay.getUTCDate() + 1);

  return nextDay;
}

export async function upsertAffiliateDailySummaryAction(
  values: AffiliateDailySummaryFormValues,
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

  const parsed = affiliateDailySummarySchema.safeParse(values);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Data affiliate summary belum valid.",
    };
  }

  const summaryDate = parseDateInput(parsed.data.summaryDate);
  const userId = session.user.id;

  if (!summaryDate) {
    return {
      ok: false,
      message: "Tanggal summary tidak valid.",
    };
  }

  const nextDay = getNextDay(summaryDate);
  const summary = await prisma.afiliateDailySumary.upsert({
    where: {
      userId_summaryDate_affiliateType: {
        userId,
        summaryDate,
        affiliateType: parsed.data.affiliateType,
      },
    },
    create: {
      userId,
      summaryDate,
      affiliateType: parsed.data.affiliateType,
      totalClicks: parsed.data.totalClicks,
      totalOrders: parsed.data.totalOrders,
      totalRevenue: parsed.data.totalRevenue,
      notes: parsed.data.notes?.trim() || null,
    },
    update: {
      totalClicks: parsed.data.totalClicks,
      totalOrders: parsed.data.totalOrders,
      totalRevenue: parsed.data.totalRevenue,
      notes: parsed.data.notes?.trim() || null,
    },
  });

  await prisma.postMetric.updateMany({
    where: {
      contentPost: {
        userId,
        publishedAt: {
          gte: summaryDate,
          lt: nextDay,
        },
        affiliateType: parsed.data.affiliateType,
      },
    },
    data: {
      afiliateDailySumaryId: summary.id,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/affiliate-summary");

  return {
    ok: true,
    message: "Affiliate daily summary berhasil disimpan.",
  };
}
