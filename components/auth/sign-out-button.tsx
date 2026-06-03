"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <Button type="button" variant="secondary" onClick={handleSignOut}>
      <LogOut className="h-4 w-4" aria-hidden="true" />
      Keluar
    </Button>
  );
}
