"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { categoryContentSchema } from "@/lib/validations/category-content";

async function requireUserId() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user.id ?? null;
}

export async function createCategoryContentAction(formData: FormData) {
  const userId = await requireUserId();

  if (!userId) {
    return;
  }

  const parsed = categoryContentSchema.safeParse({
    categoryName: formData.get("categoryName"),
  });

  if (!parsed.success) {
    return;
  }

  const existingCategory = await prisma.categoryContent.findFirst({
    where: {
      userId,
      categoryName: parsed.data.categoryName,
    },
    select: {
      id: true,
    },
  });

  if (!existingCategory) {
    await prisma.categoryContent.create({
      data: {
        userId,
        categoryName: parsed.data.categoryName,
      },
    });
  }

  revalidatePath("/dashboard/pengaturan/category");
  revalidatePath("/dashboard/content");
}

export async function updateCategoryContentAction(formData: FormData) {
  const userId = await requireUserId();
  const id = String(formData.get("id") ?? "");
  const parsed = categoryContentSchema.safeParse({
    categoryName: formData.get("categoryName"),
  });

  if (!userId || !id || !parsed.success) {
    return;
  }

  const duplicateCategory = await prisma.categoryContent.findFirst({
    where: {
      userId,
      categoryName: parsed.data.categoryName,
      NOT: {
        id,
      },
    },
    select: {
      id: true,
    },
  });

  if (duplicateCategory) {
    return;
  }

  await prisma.categoryContent.updateMany({
    where: {
      id,
      userId,
    },
    data: {
      categoryName: parsed.data.categoryName,
    },
  });

  revalidatePath("/dashboard/pengaturan/category");
  revalidatePath("/dashboard/content");
}

export async function deleteCategoryContentAction(formData: FormData) {
  const userId = await requireUserId();
  const id = String(formData.get("id") ?? "");

  if (!userId || !id) {
    return;
  }

  const usedByContent = await prisma.contentPost.count({
    where: {
      categoryId: id,
      userId,
    },
  });

  if (usedByContent > 0) {
    return;
  }

  await prisma.categoryContent.deleteMany({
    where: {
      id,
      userId,
    },
  });

  revalidatePath("/dashboard/pengaturan/category");
  revalidatePath("/dashboard/content");
}
