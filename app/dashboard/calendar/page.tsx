import { CalendarDays, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

const dayLabels = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toMonthParam(value: Date) {
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}`;
}

function parseMonthParam(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;

  if (!rawValue) {
    return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  }

  const match = /^(\d{4})-(\d{2})$/.exec(rawValue);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);

  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return null;
  }

  return new Date(year, month - 1, 1);
}

function getCalendarStart(value: Date) {
  const firstDay = new Date(value.getFullYear(), value.getMonth(), 1);
  const mondayIndex = (firstDay.getDay() + 6) % 7;
  const calendarStart = new Date(firstDay);
  calendarStart.setDate(firstDay.getDate() - mondayIndex);

  return calendarStart;
}

function getDateKey(value: Date) {
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
}

function formatMonthTitle(value: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(value);
}

function formatDateLabel(value: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "full",
  }).format(value);
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

function getPlatformCode(platform: string) {
  const codes: Record<string, string> = {
    FACEBOOK: "FB",
    INSTAGRAM: "IG",
    LAINNYA: "OT",
    THREADS: "TH",
    TIKTOK: "TT",
    WEBSITE: "WEB",
    X: "X",
    YOUTUBE: "YT",
  };

  return codes[platform] ?? platform.slice(0, 3);
}

function getContentLabel(content: {
  body: string | null;
  contentType: string;
  hook: string | null;
}) {
  return content.hook || htmlToPlainText(content.body) || content.contentType;
}

type CalendarPageProps = {
  searchParams: Promise<{
    month?: string | string[];
  }>;
};

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const params = await searchParams;
  const monthStart = parseMonthParam(params.month);

  if (!monthStart) {
    redirect(`/dashboard/calendar?month=${toMonthParam(new Date())}`);
  }

  const nextMonthStart = new Date(
    monthStart.getFullYear(),
    monthStart.getMonth() + 1,
    1,
  );
  const previousMonth = new Date(
    monthStart.getFullYear(),
    monthStart.getMonth() - 1,
    1,
  );
  const nextMonth = new Date(
    monthStart.getFullYear(),
    monthStart.getMonth() + 1,
    1,
  );
  const contentPosts = await prisma.contentPost.findMany({
    where: {
      publishedAt: {
        gte: monthStart,
        lt: nextMonthStart,
      },
    },
    orderBy: [
      {
        publishedAt: "asc",
      },
      {
        createdAt: "asc",
      },
    ],
  });
  const postsByDate = new Map<string, typeof contentPosts>();

  contentPosts.forEach((content) => {
    if (!content.publishedAt) {
      return;
    }

    const dateKey = getDateKey(content.publishedAt);
    const posts = postsByDate.get(dateKey) ?? [];

    posts.push(content);
    postsByDate.set(dateKey, posts);
  });

  const calendarStart = getCalendarStart(monthStart);
  const calendarDays = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(calendarStart);
    date.setDate(calendarStart.getDate() + index);

    return date;
  });

  return (
    <div className="space-y-6 p-2 sm:p-6">
      <div className="flex flex-col gap-3 border-2 border-border bg-accent p-4 shadow-md lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-normal">
            Content Calendar
          </h1>
          <p className="mt-1 text-sm font-bold text-foreground">
            Kalender publish konten berdasarkan tanggal publishedAt.
          </p>
        </div>
        <Button className="h-11 w-full lg:w-auto" asChild>
          <Link href="/dashboard/content/new">
            <Plus aria-hidden="true" />
            Buat Content
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="gap-4 p-4 sm:p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-2">
              <CalendarDays className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <div className="min-w-0">
                <CardTitle className="text-xl capitalize sm:text-2xl">
                  {formatMonthTitle(monthStart)}
                </CardTitle>
                <CardDescription>
                  {contentPosts.length} konten terjadwal di bulan ini.
                </CardDescription>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <Button variant="secondary" asChild>
                <Link href={`/dashboard/calendar?month=${toMonthParam(previousMonth)}`}>
                  <ChevronLeft aria-hidden="true" />
                  Sebelumnya
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/dashboard/calendar?month=${toMonthParam(new Date())}`}>
                  Bulan Ini
                </Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href={`/dashboard/calendar?month=${toMonthParam(nextMonth)}`}>
                  Berikutnya
                  <ChevronRight aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
          <div className="overflow-x-auto">
            <div className="min-w-[920px]">
              <div className="grid grid-cols-7 border-l-2 border-t-2 border-border">
                {dayLabels.map((label) => (
                  <div
                    key={label}
                    className="border-b-2 border-r-2 border-border bg-muted p-2 text-center text-xs font-black uppercase text-muted-foreground"
                  >
                    {label}
                  </div>
                ))}

                {calendarDays.map((date) => {
                  const dateKey = getDateKey(date);
                  const posts = postsByDate.get(dateKey) ?? [];
                  const isCurrentMonth = date.getMonth() === monthStart.getMonth();
                  const visiblePosts = posts.slice(0, 3);
                  const hiddenPostCount = Math.max(0, posts.length - visiblePosts.length);

                  return (
                    <div
                      key={dateKey}
                      className="min-h-36 border-b-2 border-r-2 border-border bg-background p-2"
                    >
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span
                          className={
                            isCurrentMonth
                              ? "text-sm font-black text-foreground"
                              : "text-sm font-black text-muted-foreground"
                          }
                        >
                          {date.getDate()}
                        </span>
                        {posts.length > 0 ? (
                          <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                            {posts.length}
                          </Badge>
                        ) : null}
                      </div>

                      <div className="space-y-1">
                        {visiblePosts.map((content) => (
                          <Link
                            key={content.id}
                            href={`/dashboard/content/${content.id}/edit`}
                            title={`${formatDateLabel(date)} - ${getContentLabel(content)}`}
                            className="block min-w-0 rounded-sm border-2 border-border bg-card px-2 py-1 text-xs font-black uppercase shadow-xs hover:bg-accent"
                          >
                            <span className="block truncate">
                              [{getPlatformCode(content.platform)}]{" "}
                              {getContentLabel(content)}
                            </span>
                          </Link>
                        ))}
                        {hiddenPostCount > 0 ? (
                          <div className="rounded-sm border-2 border-dashed border-border px-2 py-1 text-xs font-black text-muted-foreground">
                            +{hiddenPostCount} konten
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
