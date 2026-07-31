import Link from "next/link";
import { signOut } from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types";

export async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile: Profile | null = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    profile = data as unknown as Profile;
  }

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="text-xl font-bold text-blue-600">
            TaskRabbit.ge
          </Link>
          <nav className="hidden md:flex space-x-6">
            <Link href="/tasks" className="text-gray-600 hover:text-blue-600">
              დავალებები
            </Link>
            <Link href="/handyman" className="text-gray-600 hover:text-blue-600">
              ხელოსნები
            </Link>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-sm text-gray-600">
                {profile?.full_name || user.email}
              </span>
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
      </div>
    </header>
  );
}