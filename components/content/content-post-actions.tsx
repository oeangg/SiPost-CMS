"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Check,
  Copy,
  Edit,
  Eye,
  MoreHorizontal,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { deleteContentPostAction } from "@/app/dashboard/content/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ContentPostActionItem = {
  id: string;
  body: string | null;
  hook: string | null;
  affiliateUrl: string | null;
  categoryName: {
    categoryName: string;
  };
  platform: string;
  affiliateType: string | null;
  status: string;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type ContentPostActionsProps = {
  content: ContentPostActionItem;
  text: string;
  className?: string;
};

type MenuPosition = {
  left: number;
  top: number;
};

function formatDate(value: Date | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid gap-1">
      <p className="text-xs font-black uppercase text-muted-foreground">
        {label}
      </p>
      <div className="min-w-0 wrap-break-words text-sm font-medium">
        {value || "-"}
      </div>
    </div>
  );
}

export function ContentPostActions({
  content,
  text,
  className,
}: ContentPostActionsProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const [isPending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;

      if (
        !menuRef.current?.contains(target) &&
        !menuPanelRef.current?.contains(target)
      ) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    function closeMenu() {
      setIsMenuOpen(false);
    }

    window.addEventListener("resize", closeMenu);
    window.addEventListener("scroll", closeMenu, true);

    return () => {
      window.removeEventListener("resize", closeMenu);
      window.removeEventListener("scroll", closeMenu, true);
    };
  }, [isMenuOpen]);

  function openMenu(anchor: HTMLButtonElement) {
    const rect = anchor.getBoundingClientRect();
    const menuWidth = 224;
    const menuHeight = 184;
    const gap = 8;
    const edge = 12;
    const left = Math.min(
      window.innerWidth - menuWidth - edge,
      Math.max(edge, rect.right - menuWidth),
    );
    const top =
      rect.bottom + gap + menuHeight > window.innerHeight
        ? Math.max(edge, rect.top - menuHeight - gap)
        : rect.bottom + gap;

    setMenuPosition({ left, top });
    setIsMenuOpen(true);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setIsMenuOpen(false);
      toast.success("Teks konten tersalin", {
        description: "Content dan Affiliate URL berhasil disalin.",
      });
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Copy gagal", {
        description: "Browser tidak mengizinkan akses clipboard.",
      });
    }
  }

  function handleDelete() {
    setErrorMessage(null);

    startTransition(async () => {
      const response = await deleteContentPostAction(content.id);

      if (!response.ok) {
        setErrorMessage(response.message);
        toast.error("Hapus konten gagal", {
          description: response.message,
        });
        return;
      }

      toast.success("Konten berhasil dihapus", {
        description: response.message,
      });
      setIsDeleteOpen(false);
    });
  }

  return (
    <>
      <div ref={menuRef} className={cn("relative inline-flex", className)}>
        <Button
          type="button"
          size="icon"
          variant="secondary"
          aria-expanded={isMenuOpen}
          aria-label={`Action ${content.hook || "konten"}`}
          onClick={(event) => {
            if (isMenuOpen) {
              setIsMenuOpen(false);
              return;
            }

            openMenu(event.currentTarget);
          }}
        >
          <MoreHorizontal aria-hidden="true" />
        </Button>
      </div>

      {isMenuOpen && menuPosition
        ? createPortal(
            <div
              ref={menuPanelRef}
              className="fixed z-60 grid w-56 gap-1 border-2 border-border bg-background p-2 text-left shadow-lg"
              style={{
                left: menuPosition.left,
                top: menuPosition.top,
              }}
            >
              <Button
                variant="ghost"
                className="h-9 justify-start px-2"
                asChild
                onClick={() => setIsMenuOpen(false)}
              >
                <Link href={`/dashboard/content/${content.id}/edit`}>
                  <Edit aria-hidden="true" />
                  Edit
                </Link>
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-9 justify-start px-2"
                onClick={() => {
                  setIsDetailOpen(true);
                  setIsMenuOpen(false);
                }}
              >
                <Eye aria-hidden="true" />
                Lihat Detail
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-9 justify-start px-2"
                onClick={handleCopy}
                disabled={!text.trim()}
              >
                {copied ? (
                  <Check aria-hidden="true" />
                ) : (
                  <Copy aria-hidden="true" />
                )}
                {copied ? "Tersalin" : "Copy Teks Konten"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-9 justify-start px-2 text-destructive"
                onClick={() => {
                  setIsDeleteOpen(true);
                  setIsMenuOpen(false);
                }}
              >
                <Trash2 aria-hidden="true" />
                Hapus
              </Button>
            </div>,
            document.body,
          )
        : null}

      <DialogPrimitive.Root open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50" />
          <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 grid max-h-[85vh] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 gap-4 overflow-y-auto border-2 border-border bg-background p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <DialogPrimitive.Title className="wrap-break-words text-2xl font-black">
                  {content.hook || "Konten tanpa hook"}
                </DialogPrimitive.Title>
                <DialogPrimitive.Description className="mt-1 text-sm font-medium text-muted-foreground">
                  Detail konten tersimpan.
                </DialogPrimitive.Description>
              </div>
              <DialogPrimitive.Close asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Tutup detail"
                >
                  <X aria-hidden="true" />
                </Button>
              </DialogPrimitive.Close>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="warning">{content.status}</Badge>
              <Badge variant="secondary">{content.platform}</Badge>
              <Badge variant="secondary">{content.categoryName.categoryName}</Badge>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <DetailRow label="Affiliate" value={content.affiliateType} />
              <DetailRow label="Affiliate URL" value={content.affiliateUrl} />
              <DetailRow
                label="Published"
                value={formatDate(content.publishedAt)}
              />
              <DetailRow label="Dibuat" value={formatDate(content.createdAt)} />
              <DetailRow
                label="Diupdate"
                value={formatDate(content.updatedAt)}
              />
            </div>

            <DetailRow
              label="Konten"
              value={
                content.body ? (
                  <div
                    className="prose-content border-2 border-border bg-muted p-3"
                    dangerouslySetInnerHTML={{ __html: content.body }}
                  />
                ) : (
                  "-"
                )
              }
            />
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      <DialogPrimitive.Root open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50" />
          <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 grid w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-4 border-2 border-border bg-background p-5 shadow-xl">
            <div>
              <DialogPrimitive.Title className="text-xl font-black">
                Hapus Konten?
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-2 text-sm font-medium text-muted-foreground">
                Konten{" "}
                <span className="font-black text-foreground">
                  {content.hook || "Konten tanpa hook"}
                </span>{" "}
                akan dihapus permanen. Aksi ini tidak bisa dibatalkan.
              </DialogPrimitive.Description>
            </div>

            {errorMessage ? (
              <p className="text-sm font-medium text-destructive">
                {errorMessage}
              </p>
            ) : null}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsDeleteOpen(false)}
                disabled={isPending}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isPending}
              >
                <Trash2 aria-hidden="true" />
                {isPending ? "Menghapus..." : "Ya, Hapus"}
              </Button>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}
