"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { LogIn } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

export function LoginForm() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setErrorMessage(null);

    const response = await authClient.signIn.email(values);

    if (response.error) {
      const message =
        response.error.message ?? "Login gagal. Periksa email dan password.";

      setErrorMessage(message);
      toast.error("Login gagal", {
        description: message,
      });
      return;
    }

    toast.success("Login berhasil", {
      description: "Mengalihkan ke dashboard.",
    });
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="nama@email.com"
          {...register("email")}
        />
        {errors.email ? (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <PasswordInput
          id="password"
          autoComplete="current-password"
          placeholder="Masukkan password"
          {...register("password")}
        />
        {errors.password ? (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        ) : null}
      </div>

      {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        <LogIn className="h-4 w-4" aria-hidden="true" />
        {isSubmitting ? "Memproses..." : "Masuk"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Belum punya akun?{" "}
        <Link className="font-medium text-primary hover:underline" href="/register">
          Daftar
        </Link>
      </p>
    </form>
  );
}
