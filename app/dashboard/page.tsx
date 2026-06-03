import { BarChart3, Eye, Link2, MousePointerClick, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { prisma } from "@/lib/prisma";

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

function getMetricScore(metric: {
  clicks: number;
  comments: number;
  likes: number;
  saves: number;
  shares: number;
  views: number;
}) {
  return (
    metric.views +
    metric.likes * 3 +
    metric.comments * 5 +
    metric.shares * 6 +
    metric.saves * 4 +
    metric.clicks * 8
  );
}

export default async function DashboardPage() {
  const [
    contentCount,
    publishedCount,
    metricTotals,
    affiliateTotals,
    postsWithMetrics,
    recentAffiliateSummaries,
  ] = await Promise.all([
    prisma.contentPost.count(),
    prisma.contentPost.count({
      where: {
        status: "PUBLISHED",
      },
    }),
    prisma.postMetric.aggregate({
      _sum: {
        clicks: true,
        comments: true,
        likes: true,
        saves: true,
        shares: true,
        views: true,
      },
    }),
    prisma.afiliateDailySumary.aggregate({
      _sum: {
        totalClicks: true,
        totalOrders: true,
        totalRevenue: true,
      },
    }),
    prisma.contentPost.findMany({
      include: {
        metrics: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 25,
    }),
    prisma.afiliateDailySumary.findMany({
      orderBy: {
        summaryDate: "desc",
      },
      take: 5,
    }),
  ]);

  const totalViews = metricTotals._sum.views ?? 0;
  const totalEngagement =
    (metricTotals._sum.likes ?? 0) +
    (metricTotals._sum.comments ?? 0) +
    (metricTotals._sum.shares ?? 0) +
    (metricTotals._sum.saves ?? 0);
  const affiliateRevenue = Number(affiliateTotals._sum.totalRevenue ?? 0);

  const leaderboard = postsWithMetrics
    .map((post) => {
      const totals = post.metrics.reduce(
        (accumulator, metric) => ({
          clicks: accumulator.clicks + metric.clicks,
          comments: accumulator.comments + metric.comments,
          likes: accumulator.likes + metric.likes,
          saves: accumulator.saves + metric.saves,
          shares: accumulator.shares + metric.shares,
          views: accumulator.views + metric.views,
        }),
        {
          clicks: 0,
          comments: 0,
          likes: 0,
          saves: 0,
          shares: 0,
          views: 0,
        },
      );

      return {
        ...post,
        metricScore: getMetricScore(totals),
        totals,
      };
    })
    .sort((first, second) => second.metricScore - first.metricScore)
    .slice(0, 10);

  const summaryCards = [
    {
      title: "Total Views",
      value: formatNumber(totalViews),
      description: "Akumulasi views dari PostMetric",
      icon: Eye,
    },
    {
      title: "Engagement",
      value: formatNumber(totalEngagement),
      description: "Likes, komentar, shares, dan saves",
      icon: BarChart3,
    },
    {
      title: "Published",
      value: `${formatNumber(publishedCount)} / ${formatNumber(contentCount)}`,
      description: "Konten published dibanding total konten",
      icon: Trophy,
    },
    {
      title: "Affiliate Revenue",
      value: formatCurrency(affiliateRevenue),
      description: `${formatNumber(affiliateTotals._sum.totalOrders ?? 0)} order, ${formatNumber(
        affiliateTotals._sum.totalClicks ?? 0,
      )} klik`,
      icon: Link2,
    },
  ];

  return (
    <div className="space-y-6 p-2 sm:p-6">
      <div className="border-2 border-border bg-accent p-4 shadow-md">
        <h1 className="text-3xl font-black tracking-normal">Analitik & Leaderboard</h1>
        <p className="mt-1 text-sm font-bold text-foreground">
          Analitik performa konten dan ringkasan affiliate.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.title}>
              <CardHeader className="flex-row items-center justify-between space-y-0 p-4 pb-2 sm:p-6 sm:pb-2">
                <CardDescription className="font-black uppercase text-foreground">{card.title}</CardDescription>
                <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </CardHeader>
              <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                <CardTitle className="text-2xl sm:text-3xl">{card.value}</CardTitle>
                <p className="mt-1 text-sm font-medium text-muted-foreground">{card.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="min-w-0">
          <CardHeader className="gap-3 p-4 sm:p-6">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" aria-hidden="true" />
              <CardTitle className="text-xl sm:text-2xl">Leaderboard Konten</CardTitle>
            </div>
            <CardDescription>
              Ranking dihitung dari views, engagement, dan klik affiliate.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 sm:p-6 sm:pt-0">
            <div className="hidden md:block">
              <Table className="min-w-[760px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Hook</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                    <TableHead className="text-right">Engagement</TableHead>
                    <TableHead className="text-right">Klik</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        Belum ada PostMetric untuk leaderboard.
                      </TableCell>
                    </TableRow>
                  ) : null}

                  {leaderboard.map((post, index) => {
                    const engagement =
                      post.totals.likes +
                      post.totals.comments +
                      post.totals.shares +
                      post.totals.saves;

                    return (
                      <TableRow key={post.id}>
                        <TableCell>
                          <Badge variant={index < 3 ? "success" : "secondary"}>
                            #{index + 1}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{post.hook || "-"}</TableCell>
                        <TableCell>{post.platform}</TableCell>
                        <TableCell className="text-right">
                          {formatNumber(post.totals.views)}
                        </TableCell>
                        <TableCell className="text-right">{formatNumber(engagement)}</TableCell>
                        <TableCell className="text-right">
                          {formatNumber(post.totals.clicks)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatNumber(post.metricScore)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="grid gap-3 p-4 pt-0 md:hidden">
              {leaderboard.length === 0 ? (
                <Card className="bg-background">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">
                      Belum ada PostMetric untuk leaderboard.
                    </p>
                  </CardContent>
                </Card>
              ) : null}

              {leaderboard.map((post, index) => (
                <Card key={post.id} className="bg-background">
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold">{post.hook || "-"}</h3>
                        <p className="mt-1 text-xs text-muted-foreground">{post.platform}</p>
                      </div>
                      <Badge variant={index < 3 ? "success" : "secondary"}>#{index + 1}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Views</p>
                        <p className="font-medium">{formatNumber(post.totals.views)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Klik</p>
                        <p className="font-medium">{formatNumber(post.totals.clicks)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Score</p>
                        <p className="font-medium">{formatNumber(post.metricScore)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid min-w-0 gap-4">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-xl sm:text-2xl">Affiliate Terbaru</CardTitle>
              <CardDescription>Ringkasan affiliate harian paling baru.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 p-4 pt-0 sm:p-6 sm:pt-0">
              {recentAffiliateSummaries.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Belum ada ringkasan affiliate harian.
                </p>
              ) : null}

              {recentAffiliateSummaries.map((summary) => (
                <div
                  key={summary.id}
                  className="rounded-md border border-border bg-background p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">
                        {summary.summaryDate.toLocaleDateString("id-ID")}
                      </p>
                      <p className="text-xs text-muted-foreground">{summary.affiliateType}</p>
                    </div>
                    <Badge variant="outline">{formatNumber(summary.totalOrders)} order</Badge>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <MousePointerClick className="h-4 w-4" aria-hidden="true" />
                      {formatNumber(summary.totalClicks)} klik
                    </span>
                    <span className="font-medium">
                      {formatCurrency(Number(summary.totalRevenue))}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-xl sm:text-2xl">Formula Score</CardTitle>
              <CardDescription>Bobot leaderboard untuk membaca performa.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 p-4 pt-0 text-sm text-muted-foreground sm:p-6 sm:pt-0">
              <p>Views x1, likes x3, comments x5, shares x6, saves x4, clicks x8.</p>
              <p>Score lebih tinggi berarti konten lebih kuat untuk diprioritaskan.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
