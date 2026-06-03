import { auth } from "../lib/auth";
import { prisma } from "../lib/prisma";

async function main() {
  const email = "admin@sipost.org";
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (!existingUser) {
    await auth.api.signUpEmail({
      body: {
        name: "Super Admin",
        email,
        password: "Admin123!@",
      },
    });
  }

  await prisma.user.update({
    where: { email },
    data: {
      role: "SUPER_ADMIN",
      emailVerified: true,
    },
  });
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
