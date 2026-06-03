import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/register-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";

export default async function RegisterPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted px-4 py-8 sm:px-6 sm:py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="p-5 sm:p-6">
          <p className="text-sm font-medium text-muted-foreground">SiPost CMS</p>
          <CardTitle className="text-2xl">Daftar Akun</CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
          <RegisterForm />
        </CardContent>
      </Card>
    </main>
  );
}
