import { CalendarDays, Search } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AffiliateDailySummaryForm } from "@/components/affiliate/affiliate-daily-summary-form";
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
import { prisma } from "@/lib/prisma";

const pageSize = 20;

function toDateInputValue(value: Date) {
  return value.toISOString().slice(0, 10);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "full",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    currency: "IDR",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

function formatOptionLabel(value: string) {
  return value
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
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

function getSingleSearchParam(
  value: string | string[] | undefined,
  fallback = "",
) {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }

  return value ?? fallback;
}

function parseOptionalNumber(value: string) {
  if (!value) {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function buildPageHref(
  page: number,
  filters: {
    date: string;
    minClicks: string;
    minOrders: string;
    minCommission: string;
  },
) {
  const params = new URLSearchParams();

  if (filters.date) params.set("date", filters.date);
  if (filters.minClicks) params.set("minClicks", filters.minClicks);
  if (filters.minOrders) params.set("minOrders", filters.minOrders);
  if (filters.minCommission) {
    params.set("minCommission", filters.minCommission);
  }
  if (page > 1) params.set("page", String(page));

  const query = params.toString();

  return query
    ? `/dashboard/affiliate-summary?${query}`
    : "/dashboard/affiliate-summary";
}

type AffiliateSummaryPageProps = {
  searchParams: Promise<{
    date?: string | string[];
    minClicks?: string | string[];
    minOrders?: string | string[];
    minCommission?: string | string[];
    page?: string | string[];
  }>;
};

export default async function AffiliateSummaryPage({
  searchParams,
}: AffiliateSummaryPageProps) {
  const params = await searchParams;
  const rawDate = getSingleSearchParam(params.date);
  const rawMinClicks = getSingleSearchParam(params.minClicks);
  const rawMinOrders = getSingleSearchParam(params.minOrders);
  const rawMinCommission = getSingleSearchParam(params.minCommission);
  const rawPage = Number(getSingleSearchParam(params.page, "1"));
  const currentPage =
    Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
  const filters = {
    date: rawDate && !Number.isNaN(new Date(rawDate).getTime()) ? rawDate : "",
    minClicks: parseOptionalNumber(rawMinClicks) === null ? "" : rawMinClicks,
    minOrders: parseOptionalNumber(rawMinOrders) === null ? "" : rawMinOrders,
    minCommission:
      parseOptionalNumber(rawMinCommission) === null ? "" : rawMinCommission,
  };
  const minClicks = parseOptionalNumber(filters.minClicks);
  const minOrders = parseOptionalNumber(filters.minOrders);
  const minCommission = parseOptionalNumber(filters.minCommission);

  const contentPosts = await prisma.contentPost.findMany({
    where: {
      publishedAt: {
        not: null,
      },
      metrics: {
        some: {},
      },
    },
    include: {
      metrics: {
        orderBy: {
          metricDate: "desc",
        },
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
  });

  const groups = contentPosts.reduce<
    Record<string, { posts: typeof contentPosts; totals: {
      comments: number;
      likes: number;
      repost: number;
      shares: number;
      views: number;
    } }>
  >((accumulator, post) => {
    if (!post.publishedAt) {
      return accumulator;
    }

    const dateKey = toDateInputValue(post.publishedAt);
    const group = accumulator[dateKey] ?? {
      posts: [],
      totals: {
        comments: 0,
        likes: 0,
        repost: 0,
        shares: 0,
        views: 0,
      },
    };

    post.metrics.forEach((metric) => {
      group.totals.comments += metric.comments;
      group.totals.likes += metric.likes;
      group.totals.repost += metric.repost;
      group.totals.shares += metric.shares;
      group.totals.views += metric.views;
    });
    group.posts.push(post);
    accumulator[dateKey] = group;

    return accumulator;
  }, {});
  const dateKeys = Object.keys(groups).sort((first, second) =>
    second.localeCompare(first),
  );
  const summaries = await prisma.afiliateDailySumary.findMany({
    where: {
      summaryDate: {
        in: dateKeys.map((dateKey) => new Date(`${dateKey}T00:00:00.000Z`)),
      },
    },
  });
  const summaryByDate = new Map(
    summaries.map((summary) => [toDateInputValue(summary.summaryDate), summary]),
  );
  const filteredDateKeys = dateKeys.filter((dateKey) => {
    if (filters.date && dateKey !== filters.date) {
      return false;
    }

    const summary = summaryByDate.get(dateKey);
    const clicks = summary?.totalClicks ?? 0;
    const orders = summary?.totalOrders ?? 0;
    const commission = Number(summary?.totalRevenue ?? 0);

    if (minClicks !== null && clicks < minClicks) {
      return false;
    }

    if (minOrders !== null && orders < minOrders) {
      return false;
    }

    if (minCommission !== null && commission < minCommission) {
      return false;
    }

    return true;
  });
  const totalRows = filteredDateKeys.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const hasPagination = totalRows > pageSize;

  if (totalRows > 0 && currentPage > totalPages) {
    redirect(buildPageHref(totalPages, filters));
  }

  const paginatedDateKeys = filteredDateKeys.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const previousHref = buildPageHref(currentPage - 1, filters);
  const nextHref = buildPageHref(currentPage + 1, filters);

  return (
    <div className="space-y-6 p-2 sm:p-6">
      <div className="border-2 border-border bg-accent p-4 shadow-md">
        <h1 className="text-3xl font-black tracking-normal">
          Affiliate Daily Summary
        </h1>
        <p className="mt-1 text-sm font-bold text-foreground">
          Ringkasan affiliate berdasarkan konten yang sudah memiliki metrics,
          dikelompokkan per tanggal publish.
        </p>
      </div>

      <Card>
        <CardHeader className="gap-4 p-4 sm:p-6">
          <div>
            <CardTitle className="text-xl sm:text-2xl">
              Filter Daily Summary
            </CardTitle>
            <CardDescription>
              Menampilkan {paginatedDateKeys.length} dari {totalRows} daily
              summary.
              {hasPagination ? ` Halaman ${currentPage} dari ${totalPages}.` : ""}
            </CardDescription>
          </div>
          <form className="grid w-full min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(160px,180px)_minmax(140px,1fr)_minmax(140px,1fr)_minmax(160px,1fr)_auto_auto]">
            <div className="relative min-w-0">
              <CalendarDays
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                type="date"
                name="date"
                defaultValue={filters.date}
                className="pl-9"
                aria-label="Filter tanggal"
              />
            </div>
            <div className="relative min-w-0">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                type="number"
                min={0}
                name="minClicks"
                defaultValue={filters.minClicks}
                placeholder="Minimal klik"
                className="pl-9"
              />
            </div>
            <Input
              type="number"
              min={0}
              name="minOrders"
              defaultValue={filters.minOrders}
              placeholder="Minimal order"
            />
            <Input
              type="number"
              min={0}
              step="0.01"
              name="minCommission"
              defaultValue={filters.minCommission}
              placeholder="Minimal komisi"
            />
            <Button type="submit" className="w-full lg:w-auto">
              <Search aria-hidden="true" />
              Cari
            </Button>
            <Button variant="secondary" className="w-full lg:w-auto" asChild>
              <Link href="/dashboard/affiliate-summary">Reset</Link>
            </Button>
          </form>
        </CardHeader>
      </Card>

      {filteredDateKeys.length === 0 ? (
        <Card>
          <CardContent className="p-4 sm:p-6">
            <p className="text-sm font-medium text-muted-foreground">
              Daily summary tidak ditemukan.
            </p>
          </CardContent>
        </Card>
      ) : null}

      <div className="space-y-5">
        {paginatedDateKeys.map((dateKey) => {
          const group = groups[dateKey];
          const summary = summaryByDate.get(dateKey);

          return (
            <Card key={dateKey}>
              <CardHeader className="gap-4 p-4 sm:p-6">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <CalendarDays
                        className="h-5 w-5 text-primary"
                        aria-hidden="true"
                      />
                      <CardTitle className="text-xl sm:text-2xl">
                        {formatDate(dateKey)}
                      </CardTitle>
                    </div>
                    <CardDescription>
                      {group.posts.length} konten dengan metrics,
                      {formatNumber(group.totals.views)} views,
                      {" "}
                      {formatNumber(
                        group.totals.likes +
                          group.totals.comments +
                          group.totals.shares +
                          group.totals.repost,
                      )} engagement.
                    </CardDescription>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[420px]">
                    <div className="border-2 border-border bg-background px-3 py-2">
                      <p className="text-xs font-black uppercase text-muted-foreground">
                        Klik
                      </p>
                      <p className="text-lg font-black">
                        {formatNumber(summary?.totalClicks ?? 0)}
                      </p>
                    </div>
                    <div className="border-2 border-border bg-background px-3 py-2">
                      <p className="text-xs font-black uppercase text-muted-foreground">
                        Orders
                      </p>
                      <p className="text-lg font-black">
                        {formatNumber(summary?.totalOrders ?? 0)}
                      </p>
                    </div>
                    <div className="border-2 border-border bg-background px-3 py-2">
                      <p className="text-xs font-black uppercase text-muted-foreground">
                        Komisi
                      </p>
                      <p className="text-lg font-black">
                        {formatCurrency(Number(summary?.totalRevenue ?? 0))}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
                  <div className="min-w-0 space-y-3">
                    {group.posts.map((post) => {
                      const totals = post.metrics.reduce(
                        (accumulator, metric) => ({
                          comments: accumulator.comments + metric.comments,
                          likes: accumulator.likes + metric.likes,
                          repost: accumulator.repost + metric.repost,
                          shares: accumulator.shares + metric.shares,
                          views: accumulator.views + metric.views,
                        }),
                        {
                          comments: 0,
                          likes: 0,
                          repost: 0,
                          shares: 0,
                          views: 0,
                        },
                      );

                      return (
                        <div
                          key={post.id}
                          className="min-w-0 rounded-md border-2 border-border bg-background p-4"
                        >
                          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] md:items-start">
                            <div className="min-w-0">
                              <div className="mb-2 flex min-w-0 flex-wrap gap-2">
                                <Badge variant="outline">
                                  {formatOptionLabel(post.platform)}
                                </Badge>
                                <Badge variant="secondary">
                                  {formatOptionLabel(post.contentType)}
                                </Badge>
                                {post.affiliateType ? (
                                  <Badge variant="outline">
                                    {formatOptionLabel(post.affiliateType)}
                                  </Badge>
                                ) : null}
                              </div>
                              <h3 className="truncate text-sm font-black">
                                {post.hook || "Tanpa hook"}
                              </h3>
                              <p className="mt-2 overflow-hidden text-sm text-muted-foreground [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                                {htmlToPlainText(post.body) ||
                                  "Tidak ada body konten."}
                              </p>
                            </div>
                            <div className="grid grid-cols-4 gap-2 text-sm">
                              <div>
                                <p className="text-xs text-muted-foreground">View</p>
                                <p className="font-black">
                                  {formatNumber(totals.views)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Likes</p>
                                <p className="font-black">
                                  {formatNumber(totals.likes)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Share</p>
                                <p className="font-black">
                                  {formatNumber(totals.shares)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Post</p>
                                <p className="font-black">
                                  {formatNumber(totals.repost)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="rounded-md border-2 border-border bg-background p-4">
                    <AffiliateDailySummaryForm
                      defaultValues={{
                        summaryDate: dateKey,
                        totalClicks: summary?.totalClicks ?? 0,
                        totalOrders: summary?.totalOrders ?? 0,
                        totalRevenue: Number(summary?.totalRevenue ?? 0),
                        notes: summary?.notes ?? "",
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {hasPagination ? (
        <div className="flex flex-col gap-3 border-2 border-border bg-card p-4 shadow-md sm:flex-row sm:items-center sm:justify-between">
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
    </div>
  );
}
