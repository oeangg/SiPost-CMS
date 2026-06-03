"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { Save } from "lucide-react";
import { toast } from "sonner";
import {
  createContentPostAction,
  updateContentPostAction,
} from "@/app/dashboard/content/actions";
import { ContentRichTextEditor } from "@/components/content/content-rich-text-editor";
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

type ContentPostFormProps = {
  contentId?: string;
  defaultValues?: ContentPostFormValues;
  submitLabel?: string;
  pendingLabel?: string;
};

export function ContentPostForm({
  contentId,
  defaultValues,
  submitLabel = "Simpan Konten",
  pendingLabel = "Menyimpan...",
}: ContentPostFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ContentPostFormValues>({
    resolver: zodResolver(contentPostSchema),
    defaultValues: {
      content: "",
      hook: "",
      affiliateUrl: "",
      contentType: "LAINNYA",
      platform: "TIKTOK",
      affiliateType: "SHOPEE",
      ...defaultValues,
    },
  });

  function onSubmit(values: ContentPostFormValues) {
    setErrorMessage(null);

    startTransition(async () => {
      const response = contentId
        ? await updateContentPostAction(contentId, values)
        : await createContentPostAction(values);

      if (!response.ok) {
        setErrorMessage(response.message);
        toast.error(contentId ? "Update konten gagal" : "Simpan konten gagal", {
          description: response.message,
        });
        return;
      }

      toast.success(contentId ? "Konten berhasil diupdate" : "Konten berhasil dibuat", {
        description: response.message,
      });
      router.push("/dashboard/content");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="hook">Hook</Label>
          <Input
            id="hook"
            placeholder="Kalimat pembuka yang menarik"
            {...register("hook")}
          />
          {errors.hook ? <p className="text-sm text-destructive">{errors.hook.message}</p> : null}
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
        <div>
          <Label htmlFor="content">Content</Label>
          <p className="mt-1 text-sm text-muted-foreground">
            Teks utama yang nanti bisa disalin untuk dipaste ke medsos.
          </p>
        </div>
        <Controller
          name="content"
          control={control}
          render={({ field }) => (
            <ContentRichTextEditor
              value={field.value ?? ""}
              onChange={(value) => field.onChange(value)}
            />
          )}
        />
        {errors.content ? (
          <p className="text-sm text-destructive">{errors.content.message}</p>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
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
      </div>

      {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          <Save aria-hidden="true" />
          {isPending ? pendingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}
