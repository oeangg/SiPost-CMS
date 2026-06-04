import { ArrowLeft } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { ContentPostForm } from "@/components/content/content-post-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function NewContentPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const categories = session
    ? await prisma.categoryContent.findMany({
        where: {
          userId: session.user.id,
        },
        orderBy: {
          categoryName: "asc",
        },
      })
    : [];

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-2 sm:p-6">
      <div className="flex flex-col gap-3 border-2 border-border bg-accent p-4 shadow-md sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase text-foreground">Content Manager</p>
          <h1 className="text-3xl font-black tracking-normal">Buat Konten Baru</h1>
        </div>
        <Button variant="secondary" asChild>
          <Link href="/dashboard/content">
            <ArrowLeft aria-hidden="true" />
            Kembali
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Konten</CardTitle>
          <CardDescription className="font-medium">
            Susun hook, teks, link affiliate, platform, dan kategori untuk konten baru.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="mb-4 rounded-md border-2 border-dashed border-border p-4 text-sm font-medium text-muted-foreground">
              Belum ada kategori. Buat kategori konten dulu di{" "}
              <Link href="/dashboard/pengaturan/category" className="font-black text-foreground underline">
                Pengaturan Kategori
              </Link>
              .
            </div>
          ) : null}
          <ContentPostForm categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}
