import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { TaskDetailClient } from "@/components/tasks/TaskDetailClient";
import { notFound } from "next/navigation";
import type { Task, Review, Profile } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TaskDetailPage({ params }: PageProps) {
  const { id } = await params;
  const currentUser = await requireAuth();
  const supabase = await createClient();

  const { data: task } = await supabase
    .from("tasks")
    .select(`
      *,
      category:categories(*),
      customer:profiles!tasks_customer_id_fkey(*),
      handyman:profiles!tasks_handyman_id_fkey(*)
    `)
    .eq("id", id)
    .single();

  if (!task) notFound();

  const { data: review } = await supabase
    .from("reviews")
    .select("*")
    .eq("task_id", id)
    .maybeSingle();

  return (
    <TaskDetailClient
      task={task as Task}
      review={review as Review | null}
      currentUser={currentUser as Profile}
    />
  );
}
