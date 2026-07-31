import { requireCustomer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { TaskWizard } from "@/components/tasks/TaskWizard";
import type { Category } from "@/types";

export default async function NewTaskPage() {
  await requireCustomer();
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  return <TaskWizard categories={(categories as Category[]) || []} />;
}
