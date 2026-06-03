"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateContentPostStatusAction } from "@/app/dashboard/content/actions";
import { Select } from "@/components/ui/select";
import { postStatuses } from "@/lib/validations/content-post";

type ContentPostStatusSelectProps = {
  contentId: string;
  status: (typeof postStatuses)[number];
};

export function ContentPostStatusSelect({
  contentId,
  status,
}: ContentPostStatusSelectProps) {
  const [value, setValue] = useState(status);
  const [isPending, startTransition] = useTransition();

  function handleChange(nextStatus: string) {
    const previousStatus = value;
    const typedStatus = nextStatus as (typeof postStatuses)[number];

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

  return (
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
  );
}
