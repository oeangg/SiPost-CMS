"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { upsertPostMetricAction } from "@/app/dashboard/input-metrics/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  postMetricSchema,
  type PostMetricFormValues,
} from "@/lib/validations/input-metrics";

type PostMetricFormProps = {
  contentPostId: string;
  defaultValues: PostMetricFormValues;
};

const metricFields = [
  ["views", "Views"],
  ["likes", "Likes"],
  ["comments", "Komentar"],
  ["repost", "Repost"],
  ["shares", "Share"],
] as const;

export function PostMetricForm({
  contentPostId,
  defaultValues,
}: PostMetricFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PostMetricFormValues>({
    resolver: zodResolver(postMetricSchema),
    defaultValues,
  });

  function onSubmit(values: PostMetricFormValues) {
    setErrorMessage(null);

    startTransition(async () => {
      const response = await upsertPostMetricAction({
        ...values,
        contentPostId,
      });

      if (!response.ok) {
        setErrorMessage(response.message);
        toast.error("Metrik gagal disimpan", {
          description: response.message,
        });
        return;
      }

      toast.success("Metrik tersimpan", {
        description: response.message,
      });
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input
        type="hidden"
        {...register("contentPostId")}
        defaultValue={contentPostId}
      />
      <input type="hidden" {...register("metricDate")} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        {metricFields.map(([name, label]) => (
          <div key={name} className="space-y-2">
            <Label htmlFor={`${contentPostId}-${name}`}>{label}</Label>
            <Input
              id={`${contentPostId}-${name}`}
              type="number"
              min={0}
              inputMode="numeric"
              {...register(name, {
                valueAsNumber: true,
              })}
            />
            {errors[name] ? (
              <p className="text-xs text-destructive">
                {errors[name]?.message}
              </p>
            ) : null}
          </div>
        ))}
      </div>

      {errorMessage ? (
        <p className="text-sm text-destructive">{errorMessage}</p>
      ) : null}

      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        <Save aria-hidden="true" />
        {isPending ? "Menyimpan..." : "Simpan Metrik"}
      </Button>
    </form>
  );
}
