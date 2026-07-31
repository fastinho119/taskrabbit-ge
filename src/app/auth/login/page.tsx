"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/actions";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import type { Profile } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await signIn(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const role = (profile as Pick<Profile, "role"> | null)?.role;
      if (role === "handyman") router.push("/handyman");
      else if (role === "admin") router.push("/admin");
      else router.push("/dashboard");
    } else {
      router.push("/dashboard");
    }

    router.refresh();
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>შესვლა</CardTitle>
          <p className="text-sm text-gray-600 mt-1">TaskRabbit GE-ში შესვლა</p>
        </CardHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="email"
            name="email"
            type="email"
            label="ელ-ფოსტა"
            placeholder="example@mail.com"
            required
          />
          <Input
            id="password"
            name="password"
            type="password"
            label="პაროლი"
            placeholder="••••••••"
            required
          />

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}

          <Button type="submit" className="w-full" loading={loading}>
            შესვლა
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          არ გაქვთ ანგარიში?{" "}
          <Link href="/auth/register" className="text-primary-600 hover:underline">
            რეგისტრაცია
          </Link>
        </p>
      </Card>
    </div>
  );
}
