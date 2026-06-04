import { Pencil, Plus, Trash2 } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  createCategoryContentAction,
  deleteCategoryContentAction,
  updateCategoryContentAction,
} from "@/app/dashboard/pengaturan/category/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type CategorySettingsPageProps = {
  searchParams: Promise<{
    edit?: string | string[];
  }>;
};

function getSingleSearchParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export default async function CategorySettingsPage({
  searchParams,
}: CategorySettingsPageProps) {
  const params = await searchParams;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const categories = await prisma.categoryContent.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      categoryName: "asc",
    },
  });
  const contentCounts = await prisma.contentPost.groupBy({
    by: ["categoryId"],
    where: {
      userId: session.user.id,
    },
    _count: {
      _all: true,
    },
  });
  const contentCountByCategoryId = new Map(
    contentCounts.map((item) => [item.categoryId, item._count._all]),
  );
  const editCategoryId = getSingleSearchParam(params.edit);
  const editCategory = categories.find(
    (category) => category.id === editCategoryId,
  );

  return (
    <div className="space-y-6 p-2 sm:p-6">
      <div className="flex flex-col gap-3 border-2 border-border bg-accent p-4 shadow-md sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase text-foreground">
            Pengaturan
          </p>
          <h1 className="text-3xl font-black tracking-normal">
            Kategori Konten
          </h1>
          <p className="mt-1 text-sm font-bold text-foreground">
            Master kategori hanya untuk workspace user login.
          </p>
        </div>
        <Button variant="secondary" asChild>
          <Link href="/dashboard/content">Daftar Konten</Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Daftar Kategori</CardTitle>
            <CardDescription>
              Menampilkan {categories.length} kategori konten.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 sm:p-6 sm:pt-0">
            <div className="overflow-x-auto">
              <Table className="min-w-160">
                <TableHeader>
                  <TableRow>
                    <TableHead>Kategori</TableHead>
                    <TableHead className="text-right">Jumlah Konten</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-muted-foreground"
                      >
                        Belum ada kategori.
                      </TableCell>
                    </TableRow>
                  ) : null}

                  {categories.map((category) => {
                    const contentCount =
                      contentCountByCategoryId.get(category.id) ?? 0;

                    return (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">
                          {category.categoryName}
                        </TableCell>
                        <TableCell className="text-right">
                          {contentCount}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button variant="secondary" size="sm" asChild>
                              <Link
                                href={`/dashboard/pengaturan/category?edit=${category.id}`}
                              >
                                <Pencil aria-hidden="true" />
                              </Link>
                            </Button>
                            <form action={deleteCategoryContentAction}>
                              <input
                                type="hidden"
                                name="id"
                                value={category.id}
                              />
                              <Button
                                type="submit"
                                variant="destructive"
                                size="sm"
                                disabled={contentCount > 0}
                              >
                                <Trash2 aria-hidden="true" />
                              </Button>
                            </form>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>
              {editCategory ? "Edit Kategori" : "Tambah Kategori"}
            </CardTitle>
            <CardDescription>
              {editCategory
                ? "Perbarui nama kategori konten."
                : "Kategori ini akan muncul di form buat dan edit konten."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {editCategory ? (
              <form
                key={`edit-${editCategory.id}`}
                action={updateCategoryContentAction}
                className="space-y-3"
              >
                <input type="hidden" name="id" value={editCategory.id} />
                <Input
                  name="categoryName"
                  defaultValue={editCategory.categoryName ?? ""}
                  maxLength={80}
                  required
                />
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <Button type="submit">
                    <Pencil aria-hidden="true" />
                    Update
                  </Button>
                  <Button variant="secondary" asChild>
                    <Link href="/dashboard/pengaturan/category">Batal</Link>
                  </Button>
                </div>
              </form>
            ) : (
              <form
                key="create"
                action={createCategoryContentAction}
                className="space-y-3"
              >
                <Input
                  name="categoryName"
                  defaultValue=""
                  placeholder="Contoh: Travelling Laut"
                  maxLength={80}
                  required
                />
                <Button type="submit" className="w-full">
                  <Plus aria-hidden="true" />
                  Tambah
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
