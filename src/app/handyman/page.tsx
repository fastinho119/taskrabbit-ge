import { requireHandyman } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { HandymanFeed } from "@/components/handyman/HandymanFeed";
import type { Task, Category } from "@/types";

export default async function HandymanPage() {
  const profile = await requireHandyman();
  const supabase = await createClient();

  const [{ data: availableTasks }, { data: myTasks }, { data: categories }] =
    await Promise.all([
      supabase
        .from("tasks")
        .select("*, category:categories(*)")
        .eq("status", "pending")
        .is("handyman_id", null)
        .order("created_at", { ascending: false }),
      supabase
        .from("tasks")
        .select("*, category:categories(*)")
        .eq("handyman_id", profile.id)
        .not("status", "in", '("completed","cancelled")')
        .order("created_at", { ascending: false }),
      supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order"),
    ]);

  return (
    <HandymanFeed
      availableTasks={(availableTasks as Task[]) || []}
      myTasks={(myTasks as Task[]) || []}
      categories={(categories as Category[]) || []}
      handymanDistrict={profile.district}
    />
  );
}
