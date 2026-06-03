"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateContentPostStatusAction } from "@/app/dashboard/content/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { postStatuses } from "@/lib/validations/content-post";

type ContentPostStatusSelectProps = {
  contentId: string;
  status: (typeof postStatuses)[number];
  publishedAt: Date | null;
};

export function ContentPostStatusSelect({
  contentId,
  status,
  publishedAt,
}: ContentPostStatusSelectProps) {
  const [value, setValue] = useState(status);
  const [pendingStatus, setPendingStatus] = useState<
    (typeof postStatuses)[number] | null
  >(null);
  const [publishDate, setPublishDate] = useState(formatDateTimeLocal(publishedAt));
  const [isPending, startTransition] = useTransition();

  function formatDateTimeLocal(value: Date | null) {
    const date = value ?? new Date();
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);

    return localDate.toISOString().slice(0, 16);
  }

  function handleChange(nextStatus: string) {
    const previousStatus = value;
    const typedStatus = nextStatus as (typeof postStatuses)[number];

    if (typedStatus === "PUBLISHED") {
      setPendingStatus(typedStatus);
      setPublishDate(formatDateTimeLocal(publishedAt));
      return;
    }

    setValue(typedStatus);

    startTransition(async () => {
      const response = await updateContentPostStatusAction(contentId, typedStatus);

      if (!response.ok) {
        setValue(previousStatus);
        toast.error("Update status gagal", {
          description: response.message,
        });
        return;
      }

      toast.success("Status berhasil diupdate", {
        description: response.message,
      });
    });
  }

  function handlePublishSubmit() {
    const previousStatus = value;

    setValue("PUBLISHED");

    startTransition(async () => {
      const response = await updateContentPostStatusAction(
        contentId,
        "PUBLISHED",
        publishDate,
      );

      if (!response.ok) {
        setValue(previousStatus);
        toast.error("Update status gagal", {
          description: response.message,
        });
        return;
      }

      setPendingStatus(null);
      toast.success("Status berhasil diupdate", {
        description: response.message,
      });
    });
  }

  return (
    <>
      <Select
        value={value}
        onChange={(event) => handleChange(event.target.value)}
        disabled={isPending}
        aria-label="Ubah status konten"
        className="h-9 min-w-36 bg-background text-xs"
      >
        {postStatuses.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </Select>

      <DialogPrimitive.Root
        open={pendingStatus === "PUBLISHED"}
        onOpenChange={(open) => {
          if (!open && !isPending) {
            setPendingStatus(null);
          }
        }}
      >
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50" />
          <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 grid w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-4 border-2 border-border bg-background p-5 shadow-xl">
            <div>
              <DialogPrimitive.Title className="text-xl font-black">
                Isi Tanggal Publish
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-2 text-sm font-medium text-muted-foreground">
                Tanggal ini akan disimpan ke field publishedAt saat status menjadi
                PUBLISHED.
              </DialogPrimitive.Description>
            </div>

            <Input
              type="datetime-local"
              value={publishDate}
              onChange={(event) => setPublishDate(event.target.value)}
              disabled={isPending}
            />

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setPendingStatus(null)}
                disabled={isPending}
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={handlePublishSubmit}
                disabled={isPending || !publishDate}
              >
                {isPending ? "Menyimpan..." : "Simpan Publish"}
              </Button>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}
