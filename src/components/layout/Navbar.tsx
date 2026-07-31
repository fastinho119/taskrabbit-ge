"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { signOut } from "@/lib/actions";
import type { Profile } from "@/types";
import { Menu, X, Wrench } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        if (data) {
          setProfile(data as Profile);
        }
      }
    }
    loadProfile();
  }, [supabase]);

  const navLinks = [
    { href: "/tasks", label: "დავალებები" },
    { href: "/handyman", label: "ხელოსნები" },
    ...(profile?.role === "admin" ? [{ href: "/admin", label: "ადმინისტრაცია" }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-blue-600">
            <Wrench className="h-6 w-6" />
            <span className="text-lg">TaskRabbit.ge</span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {profile ? (
              <>
                <span className="text-sm text-gray-600">{profile.full_name}</span>
                <form action={signOut}>
                  <Button type="submit" variant="ghost" size="sm">
                    გასვლა
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">შესვლა</Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">რეგისტრაცია</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-2 py-2 text-sm font-medium rounded-md ${
                pathname === link.href
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          <div className="border-t border-gray-100 pt-3 mt-3">
            {profile ? (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700 px-2">
                  {profile.full_name}
                </div>
                <form action={signOut}>
                  <Button type="submit" variant="outline" size="sm" className="w-full justify-start text-red-600">
                    გასვლა
                  </Button>
                </form>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link href="/auth/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">
                    შესვლა
                  </Button>
                </Link>
                <Link href="/auth/register" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button size="sm" className="w-full">
                    რეგისტრაცია
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}