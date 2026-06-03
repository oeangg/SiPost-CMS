import { BarChart3, Link2, Plus, Search } from "lucide-react";
import Link from "next/link";
import { CopyContentButton } from "@/components/content/copy-content-button";
import { Badge } from "@/components/ui/badge";
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
import { prisma } from "@/lib/prisma";

function composeContentText(content: {
  affiliateUrl: string | null;
  body: string | null;
  cta: string | null;
  hook: string | null;
}) {
  return [content.hook, content.body, content.cta, content.affiliateUrl]
    .filter((value) => value && value.trim())
    .join("\n\n");
}

export default async function ContentDashboardPage() {
  const contentPosts = await prisma.contentPost.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 25,
  });

  return (
    <div className="space-y-6 p-2 sm:p-6">
      <div className="flex flex-col gap-3 border-2 border-border bg-accent p-4 shadow-md sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-normal">Content Manager</h1>
          <p className="mt-1 text-sm font-bold text-foreground">
            Kelola draft, platform, kategori, hook, CTA, dan link affiliate.
          </p>
        </div>
        <div className="grid gap-2 sm:flex">
          <Button className="w-full sm:w-auto" variant="secondary">
            <Search aria-hidden="true" />
            Cari Konten
          </Button>
          <Button className="w-full sm:w-auto" asChild>
            <Link href="/dashboard/content/new">
              <Plus aria-hidden="true" />
              Konten Baru
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="min-w-0">
          <CardHeader className="gap-4 p-4 sm:p-6 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <CardTitle className="text-xl sm:text-2xl">Daftar Konten</CardTitle>
              <CardDescription className="font-medium">
                Konten terbaru yang tersimpan di workspace SiPost.
              </CardDescription>
            </div>
            <div className="relative w-full md:w-72">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input className="pl-9" placeholder="Cari judul konten" />
            </div>
          </CardHeader>
          <CardContent className="p-0 sm:p-6 sm:pt-0">
            <div className="grid gap-3 p-4 pt-0 md:hidden">
              {contentPosts.length === 0 ? (
                <Card className="bg-background">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">
                      Belum ada konten. Buat konten pertama dari tombol Konten Baru.
                    </p>
                  </CardContent>
                </Card>
              ) : null}

              {contentPosts.map((content) => (
                <Card key={content.id} className="bg-background">
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold">{content.title}</h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {content.platform} / {content.contentType}
                        </p>
                      </div>
                      <Badge className="shrink-0" variant="warning">
                        {content.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">CTA</p>
                      <p className="mt-1 text-sm">{content.cta || "-"}</p>
                    </div>
                    <CopyContentButton
                      className="w-full"
                      text={composeContentText(content)}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="hidden md:block">
              <Table className="min-w-190">
                <TableHeader>
                  <TableRow>
                    <TableHead>Judul</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>CTA</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contentPosts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        Belum ada konten.
                      </TableCell>
                    </TableRow>
                  ) : null}

                  {contentPosts.map((content) => (
                    <TableRow key={content.id}>
                      <TableCell className="font-medium">{content.title}</TableCell>
                      <TableCell>{content.platform}</TableCell>
                      <TableCell>{content.contentType}</TableCell>
                      <TableCell>
                        <Badge variant="warning">{content.status}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{content.cta || "-"}</TableCell>
                      <TableCell className="text-right">
                        <CopyContentButton text={composeContentText(content)} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="grid min-w-0 gap-4">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-xl sm:text-2xl">Input Cepat</CardTitle>
              <CardDescription className="font-medium">Akses cepat untuk workflow utama SiPost.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 p-4 pt-0 sm:p-6 sm:pt-0">
              <Button className="w-full justify-start" asChild>
                <Link href="/dashboard/content/new">
                  <Plus aria-hidden="true" />
                  <span className="truncate">Buat ContentPost</span>
                </Link>
              </Button>
              <Button variant="secondary" className="w-full justify-start" asChild>
                <Link href="/dashboard">
                  <BarChart3 aria-hidden="true" />
                  <span className="truncate">Lihat Leaderboard</span>
                </Link>
              </Button>
              <Button variant="secondary" className="w-full justify-start" asChild>
                <Link href="/dashboard">
                  <Link2 aria-hidden="true" />
                  <span className="truncate">Analitik Affiliate</span>
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-xl sm:text-2xl">Prioritas Data</CardTitle>
              <CardDescription className="font-medium">
                Pisahkan metrik konten dan affiliate agar laporan tidak tercampur.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 p-4 pt-0 text-sm leading-6 text-muted-foreground sm:p-6 sm:pt-0">
              <p>PostMetric dicatat spesifik untuk setiap ContentPost.</p>
              <p>AfiliateDailySumary dicatat sebagai total global per hari.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
