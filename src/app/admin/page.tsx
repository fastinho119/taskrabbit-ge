import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import type { Category, PlatformSettings, Profile, Task } from "@/types";

export default async function AdminPage() {
  await requireAdmin();
  const supabase = await createClient();

  const [
    { data: settings },
    { data: categories },
    { data: users },
    { data: tasks },
    { count: totalUsers },
    { count: totalTasks },
    { count: completedTasks },
  ] = await Promise.all([
    supabase.from("platform_settings").select("*").limit(1).single(),
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("tasks").select("*").order("created_at", { ascending: false }).limit(50),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("tasks").select("*", { count: "exact", head: true }),
    supabase.from("tasks").select("*", { count: "exact", head: true }).eq("status", "completed"),
  ]);

  const { data: revenueData } = await supabase
    .from("tasks")
    .select("commission_amount")
    .eq("status", "completed");

  const totalRevenue =
    revenueData?.reduce((sum, t) => sum + (t.commission_amount || 0), 0) ?? 0;

  return (
    <AdminDashboard
      settings={settings as PlatformSettings}
      categories={(categories as Category[]) || []}
      users={(users as Profile[]) || []}
      tasks={(tasks as Task[]) || []}
      stats={{
        totalUsers: totalUsers ?? 0,
        totalTasks: totalTasks ?? 0,
        completedTasks: completedTasks ?? 0,
        totalRevenue,
      }}
    />
  );
}
