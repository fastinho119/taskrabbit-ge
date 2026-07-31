"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { TBILISI_DISTRICTS } from "@/config/pricing";

function RegisterForm() {
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") || "customer";

  const [role, setRole] = useState<"customer" | "handyman">(
    defaultRole === "handyman" ? "handyman" : "customer"
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.set("role", role);

    const result = await signUp(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-md text-center">
        <div className="text-4xl mb-4">✉️</div>
        <CardTitle>შეამოწმეთ ელ-ფოსტა</CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          დადასტურების ბმული გამოგზავნილია თქვენს ელ-ფოსტაზე.
        </p>
        <Link href="/auth/login" className="mt-4 inline-block">
          <Button variant="outline">შესვლა</Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>რეგისტრაცია</CardTitle>
        <p className="text-sm text-gray-600 mt-1">შექმენით ანგარიში TaskRabbit GE-ზე</p>
      </CardHeader>

      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => setRole("customer")}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            role === "customer"
              ? "bg-primary-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          მომხმარებელი
        </button>
        <button
          type="button"
          onClick={() => setRole("handyman")}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            role === "handyman"
              ? "bg-primary-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          ხელოსანი
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="full_name"
          name="full_name"
          label="სახელი და გვარი"
          placeholder="გიორგი გიორგაძე"
          required
        />
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
          placeholder="მინ. 6 სიმბოლო"
          minLength={6}
          required
        />
        <Input
          id="phone"
          name="phone"
          type="tel"
          label="ტელეფონი"
          placeholder="+995 555 123 456"
        />

        {role === "handyman" && (
          <Select
            id="district"
            name="district"
            label="რაიონი (თბილისი)"
            options={[
              { value: "", label: "აირჩიეთ რაიონი" },
              ...TBILISI_DISTRICTS.map((d) => ({ value: d, label: d })),
            ]}
            required
          />
        )}

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        <Button type="submit" className="w-full" loading={loading}>
          {role === "customer" ? "რეგისტრაცია" : "რეგისტრაცია ხელოსნად"}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        უკვე გაქვთ ანგარიში?{" "}
        <Link href="/auth/login" className="text-primary-600 hover:underline">
          შესვლა
        </Link>
      </p>
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-gray-500">იტვირთება...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
