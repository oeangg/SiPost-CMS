import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  LockKeyhole,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const benefits = [
  {
    title: "Konten lebih terstruktur",
    description:
      "Simpan ide, hook, CTA, media, platform, dan link affiliate dalam satu alur kerja yang rapi.",
    icon: ClipboardList,
  },
  {
    title: "Metrik per konten",
    description:
      "Catat views, likes, komentar, share, saves, dan klik spesifik untuk setiap post.",
    icon: BarChart3,
  },
  {
    title: "Affiliate harian",
    description:
      "Pisahkan performa Shopee Affiliate sebagai ringkasan global harian untuk klik dan pesanan.",
    icon: CalendarDays,
  },
  {
    title: "Siap dikembangkan",
    description:
      "Fondasi auth, database, dan dashboard sudah disiapkan untuk kebutuhan CMS publik.",
    icon: LockKeyhole,
  },
];

const workflow = [
  "Rencanakan konten berdasarkan platform dan kategori.",
  "Tambahkan hook, CTA, media, dan link affiliate.",
  "Publikasikan konten lalu catat performanya secara manual.",
  "Pantau tren konten dan ringkasan affiliate dari dashboard.",
];

export default function Home() {
  return (
    <main className="min-h-screen text-foreground">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 sm:py-6">
        <header className="flex items-center justify-between gap-3 border-2 border-border bg-card px-3 py-3 shadow-md sm:px-5">
          <Link href="/" className="text-2xl font-black tracking-normal">
            SiPost
          </Link>
          <nav className="flex shrink-0 items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Masuk</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">Daftar</Link>
            </Button>
          </nav>
        </header>

        <div className="grid flex-1 items-center gap-8 py-8 sm:py-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6 sm:space-y-7">
            <div className="inline-flex max-w-full items-center gap-2 rounded-md border-2 border-border bg-accent px-3 py-2 text-sm font-black uppercase shadow-sm">
              <TrendingUp className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Creator Affiliate CMS</span>
            </div>

            <div className="space-y-5">
              <h1 className="max-w-3xl text-4xl font-black tracking-normal sm:text-6xl lg:text-7xl">
                Kelola konten medsos dan performa affiliate dari satu tempat.
              </h1>
              <p className="max-w-2xl border-l-4 border-border bg-card px-4 py-3 text-base font-medium leading-7 shadow-sm sm:text-lg sm:leading-8">
                SiPost adalah CMS untuk merencanakan konten, menyimpan detail
                eksekusi seperti hook dan CTA, lalu mencatat metrik post serta
                ringkasan harian Shopee Affiliate secara manual.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button className="w-full sm:w-auto" asChild>
                <Link href="/register">Mulai Daftar</Link>
              </Button>
              <Button className="w-full sm:w-auto" variant="secondary" asChild>
                <Link href="/login">Masuk ke Dashboard</Link>
              </Button>
            </div>
          </div>

          <Card className="relative overflow-hidden bg-secondary p-2 rotate-1">
            <Image
              src="/images/sipost-hero.png"
              alt="Dashboard SiPost untuk perencanaan konten dan performa affiliate"
              width={1536}
              height={1024}
              priority
              className="aspect-4/3 h-auto w-full rounded-sm border-2 border-border object-cover"
            />
          </Card>
        </div>
      </section>

      <section className="border-y-2 border-border bg-primary">
        <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-12 sm:px-6 sm:py-14 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-black uppercase">Apa itu SiPost?</p>
            <h2 className="mt-3 text-2xl font-black tracking-normal sm:text-4xl">
              Sistem kerja sederhana untuk konten yang perlu dicatat manual.
            </h2>
          </div>
          <p className="border-2 border-border bg-card p-4 text-base font-medium leading-7 shadow-md sm:text-lg sm:leading-8">
            SiPost membantu creator, affiliate marketer, dan tim kecil
            menyatukan rencana konten dengan pencatatan performa. Data sosial
            disimpan per konten, sementara data Shopee Affiliate dicatat sebagai
            total akumulasi harian agar tidak tercampur dengan metrik platform.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-14">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-black uppercase text-accent">Keunggulan</p>
            <h2 className="mt-3 text-2xl font-black tracking-normal sm:text-4xl">
              Dibuat untuk workflow konten dan affiliate.
            </h2>
          </div>
          <Button className="w-full sm:w-auto" variant="secondary" asChild>
            <Link href="/register">Buat Akun</Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <Card key={benefit.title}>
                <CardHeader>
                  <div className="flex size-11 items-center justify-center rounded-md border-2 border-border bg-primary shadow-xs">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-base">{benefit.title}</CardTitle>
                  <CardDescription className="font-medium leading-6">
                    {benefit.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="border-y-2 border-border bg-foreground text-background">
        <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-12 sm:px-6 sm:py-14 lg:grid-cols-2">
          <div>
            <p className="text-sm font-black uppercase text-primary">Alur kerja</p>
            <h2 className="mt-3 text-2xl font-black tracking-normal sm:text-4xl">
              Dari ide konten sampai catatan performa.
            </h2>
          </div>
          <div className="grid gap-4">
            {workflow.map((item) => (
              <div key={item} className="flex items-start gap-3 border-2 border-background bg-accent p-3 text-foreground shadow-[4px_4px_0_0_oklch(1_0_0)]">
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0" aria-hidden="true" />
                <p className="font-bold leading-7">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-14">
        <Card>
          <CardContent className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <CardTitle className="text-xl sm:text-3xl">Siapkan ruang kerja kontenmu di SiPost.</CardTitle>
              <CardDescription className="mt-2 text-base font-medium">
                Daftar untuk mulai menyusun konten dan mencatat performa secara
                terpisah antara metrik post dan ringkasan affiliate.
              </CardDescription>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button className="w-full sm:w-auto" asChild>
                <Link href="/register">Daftar Sekarang</Link>
              </Button>
              <Button className="w-full sm:w-auto" variant="secondary" asChild>
                <Link href="/login">Masuk</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
