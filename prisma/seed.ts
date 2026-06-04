import { auth } from "../lib/auth";
import { prisma } from "../lib/prisma";

const defaultCategoryContents = ["TRAVELLING", "PERSIB", "GUNUNG", "LAUT"];

async function main() {
  const email = "oeang@sipost.net";
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (!existingUser) {
    await auth.api.signUpEmail({
      body: {
        name: "Subhan Mohammad",
        email,
        password: "Admin123!@",
      },
    });
  }

  const adminUser = await prisma.user.update({
    where: { email },
    data: {
      role: "SUPER_ADMIN",
      emailVerified: true,
    },
  });

  for (const categoryName of defaultCategoryContents) {
    const existingCategory = await prisma.categoryContent.findFirst({
      where: {
        userId: adminUser.id,
        categoryName,
      },
      select: {
        id: true,
      },
    });

    if (!existingCategory) {
      await prisma.categoryContent.create({
        data: {
          userId: adminUser.id,
          categoryName,
        },
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
