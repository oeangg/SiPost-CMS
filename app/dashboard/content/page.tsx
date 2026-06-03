import { BarChart3, Link2, Plus, Search } from "lucide-react";
import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ContentPostActions } from "@/components/content/content-post-actions";
import { ContentPostStatusSelect } from "@/components/content/content-post-status-select";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import {
  contentTypes,
  platforms,
  postStatuses,
} from "@/lib/validations/content-post";

const pageSize = 20;

function htmlToPlainText(value: string | null) {
  if (!value) {
    return null;
  }

  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|h2|h3|li|blockquote)>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function composeContentText(content: {
  affiliateUrl: string | null;
  body: string | null;
  cta: string | null;
  hook: string | null;
}) {
  return [content.hook, htmlToPlainText(content.body), content.cta, content.affiliateUrl]
    .filter((value) => value && value.trim())
    .join("\n\n");
}

function getSingleSearchParam(
  value: string | string[] | undefined,
  fallback = "",
) {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }

  return value ?? fallback;
}

function isOption<T extends readonly string[]>(options: T, value: string) {
  return options.includes(value as T[number]);
}

function buildPageHref(
  page: number,
  filters: {
    q: string;
    platform: string;
    contentType: string;
    status: string;
  },
) {
  const params = new URLSearchParams();

  if (filters.q) params.set("q", filters.q);
  if (filters.platform) params.set("platform", filters.platform);
  if (filters.contentType) params.set("contentType", filters.contentType);
  if (filters.status) params.set("status", filters.status);
  if (page > 1) params.set("page", String(page));

  const query = params.toString();

  return query ? `/dashboard/content?${query}` : "/dashboard/content";
}

type ContentDashboardPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    platform?: string | string[];
    contentType?: string | string[];
    status?: string | string[];
    page?: string | string[];
  }>;
};

export default async function ContentDashboardPage({
  searchParams,
}: ContentDashboardPageProps) {
  const params = await searchParams;
  const q = getSingleSearchParam(params.q).trim();
  const platform = getSingleSearchParam(params.platform);
  const contentType = getSingleSearchParam(params.contentType);
  const status = getSingleSearchParam(params.status);
  const rawPage = Number(getSingleSearchParam(params.page, "1"));
  const currentPage =
    Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;

  const filters = {
    q,
    platform: isOption(platforms, platform) ? platform : "",
    contentType: isOption(contentTypes, contentType) ? contentType : "",
    status: isOption(postStatuses, status) ? status : "",
  };
  const where: Prisma.ContentPostWhereInput = {};

  if (filters.q) {
    where.title = {
      contains: filters.q,
      mode: "insensitive",
    };
  }

  if (filters.platform) {
    where.platform = filters.platform as (typeof platforms)[number];
  }

  if (filters.contentType) {
    where.contentType = filters.contentType as (typeof contentTypes)[number];
  }

  if (filters.status) {
    where.status = filters.status as (typeof postStatuses)[number];
  }

  const [contentPosts, totalRows] = await Promise.all([
    prisma.contentPost.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    }),
    prisma.contentPost.count({
      where,
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const hasPagination = totalRows > pageSize;

  if (totalRows > 0 && currentPage > totalPages) {
    redirect(buildPageHref(totalPages, filters));
  }

  const previousHref = buildPageHref(currentPage - 1, filters);
  const nextHref = buildPageHref(currentPage + 1, filters);

  return (
    <div className="space-y-6 p-2 sm:p-6">
      <div className="flex flex-col gap-3 border-2 border-border bg-accent p-4 shadow-md sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-normal">
            Content Manager
          </h1>
          <p className="mt-1 text-sm font-bold text-foreground">
            Kelola draft, platform, kategori, hook, CTA, dan link affiliate.
          </p>
        </div>
        <div className="grid w-full gap-2 sm:w-auto sm:grid-cols-3">
          <Button className="h-11 w-full px-3 sm:w-44" asChild>
            <Link href="/dashboard/content/new">
              <Plus aria-hidden="true" />
              <span className="truncate">Buat Content</span>
            </Link>
          </Button>
          <Button variant="secondary" className="h-11 w-full px-3 sm:w-44" asChild>
            <Link href="/dashboard">
              <BarChart3 aria-hidden="true" />
              <span className="truncate">Lihat Leaderboard</span>
            </Link>
          </Button>
          <Button variant="secondary" className="h-11 w-full px-3 sm:w-44" asChild>
            <Link href="/dashboard">
              <Link2 aria-hidden="true" />
              <span className="truncate">Analitik Affiliate</span>
            </Link>
          </Button>
        </div>
      </div>

      <div className="w-full min-w-0">
        <Card className="w-full min-w-0">
          <CardHeader className="gap-4 p-4 sm:p-6">
            <div className="min-w-0">
              <CardTitle className="text-xl sm:text-2xl">
                Daftar Konten
              </CardTitle>
              <CardDescription className="font-medium">
                Konten terbaru yang tersimpan di workspace SiPost.
              </CardDescription>
            </div>
            <form className="grid w-full min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-[minmax(220px,1fr)_minmax(150px,180px)_minmax(150px,180px)_minmax(140px,160px)_auto_auto]">
              <div className="relative min-w-0 sm:col-span-2 lg:col-span-4 2xl:col-span-1">
                <Search
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  name="q"
                  className="pl-9"
                  placeholder="Cari judul konten"
                  defaultValue={filters.q}
                />
              </div>
              <Select
                name="platform"
                defaultValue={filters.platform}
                aria-label="Filter platform"
                className="min-w-0"
              >
                <option value="">Semua Platform</option>
                {platforms.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
              <Select
                name="contentType"
                defaultValue={filters.contentType}
                aria-label="Filter kategori"
                className="min-w-0"
              >
                <option value="">Semua Kategori</option>
                {contentTypes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
              <Select
                name="status"
                defaultValue={filters.status}
                aria-label="Filter status"
                className="min-w-0"
              >
                <option value="">Semua Status</option>
                {postStatuses.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
              <Button type="submit" className="w-full 2xl:w-auto">
                <Search aria-hidden="true" />
                Cari
              </Button>
              <Button variant="secondary" className="w-full 2xl:w-auto" asChild>
                <Link href="/dashboard/content">Reset</Link>
              </Button>
            </form>
          </CardHeader>
          <CardContent className="p-0 sm:p-6 sm:pt-0">
            <div className="px-4 pb-3 text-sm font-medium text-muted-foreground sm:px-0">
              Menampilkan {contentPosts.length} dari {totalRows} konten.
            </div>
            <div className="grid gap-3 p-4 pt-0 md:hidden">
              {contentPosts.length === 0 ? (
                <Card className="bg-background">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">
                      Belum ada konten. Buat konten pertama dari tombol Konten
                      Baru.
                    </p>
                  </CardContent>
                </Card>
              ) : null}

              {contentPosts.map((content) => (
                <Card key={content.id} className="bg-background">
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold">
                          {content.title}
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {content.platform} / {content.contentType}
                        </p>
                      </div>
                      <div className="shrink-0">
                        <ContentPostStatusSelect
                          contentId={content.id}
                          status={content.status}
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        CTA
                      </p>
                      <p className="mt-1 text-sm">{content.cta || "-"}</p>
                    </div>
                    <div className="flex justify-end">
                      <ContentPostActions
                        content={content}
                        text={composeContentText(content)}
                      />
                    </div>
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
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground"
                      >
                        Belum ada konten.
                      </TableCell>
                    </TableRow>
                  ) : null}

                  {contentPosts.map((content) => (
                    <TableRow key={content.id}>
                      <TableCell className="font-medium">
                        {content.title}
                      </TableCell>
                      <TableCell>{content.platform}</TableCell>
                      <TableCell>{content.contentType}</TableCell>
                      <TableCell>
                        <ContentPostStatusSelect
                          contentId={content.id}
                          status={content.status}
                        />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {content.cta || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <ContentPostActions
                          content={content}
                          text={composeContentText(content)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {hasPagination ? (
              <div className="flex flex-col gap-3 border-t-2 border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:px-0 sm:pb-0">
                <p className="text-sm font-medium text-muted-foreground">
                  Halaman {currentPage} dari {totalPages}
                </p>
                <div className="flex gap-2">
                  {currentPage <= 1 ? (
                    <Button type="button" variant="secondary" disabled>
                      Sebelumnya
                    </Button>
                  ) : (
                    <Button variant="secondary" asChild>
                      <Link href={previousHref}>Sebelumnya</Link>
                    </Button>
                  )}
                  {currentPage >= totalPages ? (
                    <Button type="button" variant="secondary" disabled>
                      Berikutnya
                    </Button>
                  ) : (
                    <Button variant="secondary" asChild>
                      <Link href={nextHref}>Berikutnya</Link>
                    </Button>
                  )}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
