"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { CornerDownLeft, FileText, Link2, Plus, Save } from "lucide-react";
import { createContentPostAction } from "@/app/dashboard/content/actions";
import {
  affiliateTypes,
  contentPostSchema,
  contentTypes,
  platforms,
  type ContentPostFormValues,
} from "@/lib/validations/content-post";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const contentTemplates = [
  {
    label: "Jeda Baris",
    icon: CornerDownLeft,
    value: "\n\n",
  },
  {
    label: "CTA Link",
    icon: Link2,
    value: "\n\nCek detailnya lewat link affiliate di bio.",
  },
  {
    label: "Format Review",
    icon: FileText,
    value: "Hook:\n\nMasalah:\n\nSolusi:\n\nBenefit:\n\nCTA:",
  },
];

function splitMediaUrls(value: string) {
  const mediaUrls = value
    .split(/\r?\n/)
    .map((url) => url.trim())
    .filter(Boolean);

  return mediaUrls.length > 0 ? mediaUrls : null;
}

export function ContentPostForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mediaUrlsText, setMediaUrlsText] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ContentPostFormValues>({
    resolver: zodResolver(contentPostSchema),
    defaultValues: {
      title: "",
      content: "",
      hook: "",
      cta: "",
      affiliateUrl: "",
      mediaUrls: null,
      contentType: "LAINNYA",
      platform: "TIKTOK",
      affiliateType: "SHOPEE",
    },
  });

  const content = watch("content");

  function appendToContent(value: string) {
    setValue("content", `${content ?? ""}${value}`, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function onSubmit(values: ContentPostFormValues) {
    setErrorMessage(null);
    const payload = {
      ...values,
      mediaUrls: splitMediaUrls(mediaUrlsText),
    };

    startTransition(async () => {
      const response = await createContentPostAction(payload);

      if (!response.ok) {
        setErrorMessage(response.message);
        return;
      }

      router.push("/dashboard/content");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="title">Judul Konten</Label>
          <Input
            id="title"
            placeholder="Contoh: Review produk affiliate minggu ini"
            {...register("title")}
          />
          {errors.title ? <p className="text-sm text-destructive">{errors.title.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="platform">Platform</Label>
          <Select id="platform" {...register("platform")}>
            {platforms.map((platform) => (
              <option key={platform} value={platform}>
                {platform}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contentType">Kategori Konten</Label>
          <Select id="contentType" {...register("contentType")}>
            {contentTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Label htmlFor="content">Content</Label>
            <p className="mt-1 text-sm text-muted-foreground">
              Teks utama yang nanti bisa disalin untuk dipaste ke medsos.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {contentTemplates.map((template) => {
              const Icon = template.icon;

              return (
                <Button
                  key={template.label}
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => appendToContent(template.value)}
                >
                  <Icon aria-hidden="true" />
                  {template.label}
                </Button>
              );
            })}
          </div>
        </div>
        <Textarea
          id="content"
          className="min-h-48"
          placeholder="Tulis teks konten lengkap di sini..."
          {...register("content")}
        />
        {errors.content ? (
          <p className="text-sm text-destructive">{errors.content.message}</p>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="hook">Hook</Label>
          <Input id="hook" placeholder="Kalimat pembuka yang menarik" {...register("hook")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cta">CTA</Label>
          <Input id="cta" placeholder="Contoh: Cek link affiliate di bio" {...register("cta")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="affiliateUrl">Affiliate URL</Label>
          <Input
            id="affiliateUrl"
            type="url"
            placeholder="https://..."
            {...register("affiliateUrl")}
          />
          {errors.affiliateUrl ? (
            <p className="text-sm text-destructive">{errors.affiliateUrl.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="affiliateType">Kategori Affiliate</Label>
          <Select id="affiliateType" {...register("affiliateType")}>
            <option value="">Tanpa affiliate</option>
            {affiliateTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="mediaUrls">Media URLs</Label>
          <Textarea
            id="mediaUrls"
            className="min-h-24"
            placeholder="Opsional untuk MVP. Isi satu URL media per baris, atau biarkan kosong."
            value={mediaUrlsText}
            onChange={(event) => setMediaUrlsText(event.target.value)}
          />
        </div>
      </div>

      {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          <Save aria-hidden="true" />
          {isPending ? "Menyimpan..." : "Simpan Konten"}
        </Button>
        <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={() => appendToContent("\n\n")}>
          <Plus aria-hidden="true" />
          Tambah Jeda
        </Button>
      </div>
    </form>
  );
}
