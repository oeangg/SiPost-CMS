"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { upsertAffiliateDailySummaryAction } from "@/app/dashboard/affiliate-summary/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  affiliateDailySummarySchema,
  type AffiliateDailySummaryFormValues,
} from "@/lib/validations/affiliate-summary";

type AffiliateDailySummaryFormProps = {
  defaultValues: AffiliateDailySummaryFormValues;
};

export function AffiliateDailySummaryForm({
  defaultValues,
}: AffiliateDailySummaryFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AffiliateDailySummaryFormValues>({
    resolver: zodResolver(affiliateDailySummarySchema),
    defaultValues,
  });

  function onSubmit(values: AffiliateDailySummaryFormValues) {
    setErrorMessage(null);

    startTransition(async () => {
      const response = await upsertAffiliateDailySummaryAction(values);

      if (!response.ok) {
        setErrorMessage(response.message);
        toast.error("Affiliate summary gagal disimpan", {
          description: response.message,
        });
        return;
      }

      toast.success("Affiliate summary tersimpan", {
        description: response.message,
      });
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register("summaryDate")} />
      <input type="hidden" {...register("affiliateType")} />

      <div className="grid gap-3 grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor={`${defaultValues.summaryDate}-totalClicks`}>
            Total Klik
          </Label>
          <Input
            id={`${defaultValues.summaryDate}-totalClicks`}
            type="number"
            min={0}
            inputMode="numeric"
            {...register("totalClicks", {
              valueAsNumber: true,
            })}
          />
          {errors.totalClicks ? (
            <p className="text-xs text-destructive">
              {errors.totalClicks.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${defaultValues.summaryDate}-totalOrders`}>
            Order
          </Label>
          <Input
            id={`${defaultValues.summaryDate}-totalOrders`}
            type="number"
            min={0}
            inputMode="numeric"
            {...register("totalOrders", {
              valueAsNumber: true,
            })}
          />
          {errors.totalOrders ? (
            <p className="text-xs text-destructive">
              {errors.totalOrders.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${defaultValues.summaryDate}-totalRevenue`}>
            Komisi
          </Label>
          <Input
            id={`${defaultValues.summaryDate}-totalRevenue`}
            type="number"
            min={0}
            inputMode="decimal"
            step="0.01"
            {...register("totalRevenue", {
              valueAsNumber: true,
            })}
          />
          {errors.totalRevenue ? (
            <p className="text-xs text-destructive">
              {errors.totalRevenue.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${defaultValues.summaryDate}-notes`}>Keterangan</Label>
        <Textarea
          id={`${defaultValues.summaryDate}-notes`}
          placeholder="Keterangan performa affiliate"
          {...register("notes")}
        />
        {errors.notes ? (
          <p className="text-xs text-destructive">{errors.notes.message}</p>
        ) : null}
      </div>

      {errorMessage ? (
        <p className="text-sm text-destructive">{errorMessage}</p>
      ) : null}

      <Button type="submit" disabled={isPending} className="w-full">
        <Save aria-hidden="true" />
        {isPending ? "Menyimpan..." : "Simpan Summary"}
      </Button>
    </form>
  );
}
