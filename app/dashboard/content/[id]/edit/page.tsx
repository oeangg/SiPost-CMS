import { ArrowLeft } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
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

type EditContentPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditContentPage({ params }: EditContentPageProps) {
  const { id } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    notFound();
  }

  const content = await prisma.contentPost.findUnique({
    where: {
      id,
    },
  });
  const categories = await prisma.categoryContent.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      categoryName: "asc",
    },
  });

  if (!content || content.userId !== session.user.id) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-2 sm:p-6">
      <div className="flex flex-col gap-3 border-2 border-border bg-accent p-4 shadow-md sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase text-foreground">Content Manager</p>
          <h1 className="text-3xl font-black tracking-normal">Edit Konten</h1>
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
            Perbarui hook, CTA, teks, link affiliate, platform, dan kategori konten.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContentPostForm
            categories={categories}
            contentId={content.id}
            defaultValues={{
              content: content.body ?? "",
              hook: content.hook ?? "",
              cta: content.cta ?? "",
              affiliateUrl: content.affiliateUrl ?? "",
              categoryId: content.categoryId,
              platform: content.platform,
              affiliateType: content.affiliateType ?? "",
            }}
            submitLabel="Update Konten"
            pendingLabel="Mengupdate..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
