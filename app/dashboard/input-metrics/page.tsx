import { FileBarChart, Search } from "lucide-react";
import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PostMetricForm } from "@/components/metrics/post-metric-form";
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
import { Select } from "@/components/ui/select";
import { prisma } from "@/lib/prisma";
import { contentTypes, platforms } from "@/lib/validations/content-post";

const pageSize = 20;

function toDateInputValue(value: Date) {
  return value.toISOString().slice(0, 10);
}

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

function formatPublishedAt(value: Date | null) {
  if (!value) {
    return "Belum publish";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function formatOptionLabel(value: string) {
  return value
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
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
  },
) {
  const params = new URLSearchParams();

  if (filters.q) params.set("q", filters.q);
  if (filters.platform) params.set("platform", filters.platform);
  if (filters.contentType) params.set("contentType", filters.contentType);
  if (page > 1) params.set("page", String(page));

  const query = params.toString();

  return query ? `/dashboard/input-metrics?${query}` : "/dashboard/input-metrics";
}

type InputMetricsPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    platform?: string | string[];
    contentType?: string | string[];
    page?: string | string[];
  }>;
};

export default async function InputMetricsPage({
  searchParams,
}: InputMetricsPageProps) {
  const params = await searchParams;
  const q = getSingleSearchParam(params.q).trim();
  const platform = getSingleSearchParam(params.platform);
  const contentType = getSingleSearchParam(params.contentType);
  const rawPage = Number(getSingleSearchParam(params.page, "1"));
  const currentPage =
    Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
  const metricDateInput = toDateInputValue(new Date());

  const filters = {
    q,
    platform: isOption(platforms, platform) ? platform : "",
    contentType: isOption(contentTypes, contentType) ? contentType : "",
  };
  const where: Prisma.ContentPostWhereInput = {};

  if (filters.q) {
    where.hook = {
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

  const [contentPosts, totalRows] = await Promise.all([
    prisma.contentPost.findMany({
      where,
      include: {
        metrics: {
          where: {
            metricDate: new Date(metricDateInput),
          },
          take: 1,
        },
      },
      orderBy: [
        {
          publishedAt: {
            sort: "desc",
            nulls: "last",
          },
        },
        {
          createdAt: "desc",
        },
      ],
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
      <div className="border-2 border-border bg-accent p-4 shadow-md">
        <h1 className="text-3xl font-black tracking-normal">Input Metrics</h1>
        <p className="mt-1 text-sm font-bold text-foreground">
          Daftar konten diurutkan dari tanggal publish terbaru.
        </p>
      </div>

      <Card>
        <CardHeader className="gap-4 p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-2">
              <FileBarChart
                className="h-5 w-5 shrink-0 text-primary"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <CardTitle className="text-xl sm:text-2xl">
                  Daftar Konten
                </CardTitle>
                <CardDescription>
                  Menampilkan {contentPosts.length} dari {totalRows} konten.
                  {hasPagination ? ` Halaman ${currentPage} dari ${totalPages}.` : ""}
                </CardDescription>
              </div>
            </div>
            <Button variant="secondary" asChild>
              <Link href="/dashboard/content">Kelola Konten</Link>
            </Button>
          </div>

          <form className="grid w-full min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(220px,1fr)_minmax(150px,180px)_minmax(150px,180px)_auto_auto]">
            <div className="relative min-w-0 sm:col-span-2 lg:col-span-1">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                name="q"
                className="pl-9"
                placeholder="Cari hook konten"
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
            <Button type="submit" className="w-full lg:w-auto">
              <Search aria-hidden="true" />
              Cari
            </Button>
            <Button variant="secondary" className="w-full lg:w-auto" asChild>
              <Link href="/dashboard/input-metrics">Reset</Link>
            </Button>
          </form>
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
          {contentPosts.length === 0 ? (
            <div className="rounded-md border-2 border-dashed border-border p-4 text-sm font-medium text-muted-foreground">
              Konten tidak ditemukan.
            </div>
          ) : null}

          <div className="grid gap-4 xl:grid-cols-2">
            {contentPosts.map((content) => {
              const metric = content.metrics[0];

              return (
                <Card key={content.id} className="flex min-w-0 flex-col bg-background">
                  <CardHeader className="gap-3 p-4">
                    <div className="flex min-w-0 flex-col gap-3">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex min-w-0 flex-wrap gap-2">
                          <Badge variant="outline">
                            {formatOptionLabel(content.platform)}
                          </Badge>
                          <Badge variant="secondary">
                            {formatOptionLabel(content.contentType)}
                          </Badge>
                          {metric ? (
                            <Badge variant="success">Sudah ada data</Badge>
                          ) : null}
                        </div>
                        <Badge
                          variant={content.publishedAt ? "outline" : "warning"}
                          className="w-fit shrink-0"
                        >
                          {formatPublishedAt(content.publishedAt)}
                        </Badge>
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-base leading-snug sm:text-lg">
                          {content.hook || "Tanpa hook"}
                        </CardTitle>
                        <CardDescription className="mt-2 overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                          {htmlToPlainText(content.body) ||
                            "Tidak ada body konten."}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="mt-auto p-4 pt-0">
                    <PostMetricForm
                      contentPostId={content.id}
                      defaultValues={{
                        contentPostId: content.id,
                        metricDate: metricDateInput,
                        views: metric?.views ?? 0,
                        likes: metric?.likes ?? 0,
                        comments: metric?.comments ?? 0,
                        shares: metric?.shares ?? 0,
                        repost: metric?.repost ?? 0,
                      }}
                    />
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {hasPagination ? (
            <div className="mt-6 flex flex-col gap-3 border-t-2 border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
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
  );
}
