"use client";

import type * as React from "react";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      closeButton
      richColors
      position="top-right"
      toastOptions={{
        classNames: {
          toast: "border-2 border-border bg-background text-foreground shadow-lg",
          title: "font-black",
          description: "font-medium text-muted-foreground",
          actionButton: "bg-primary text-primary-foreground",
          cancelButton: "bg-muted text-muted-foreground",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
