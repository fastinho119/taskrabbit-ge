import Link from "next/link";
import { requireCustomer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { formatGEL } from "@/config/pricing";
import { formatRelativeTime } from "@/lib/utils";
import type { Task } from "@/types";
import { Plus, MapPin, Clock } from "lucide-react";

export default async function DashboardPage() {
  const profile = await requireCustomer();
  const supabase = await createClient();

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*, category:categories(*)")
    .eq("customer_id", profile.id)
    .order("created_at", { ascending: false });

  const activeTasks = (tasks as Task[])?.filter(
    (t) => !["completed", "cancelled"].includes(t.status)
  ) ?? [];
  const historyTasks = (tasks as Task[])?.filter(
    (t) => ["completed", "cancelled"].includes(t.status)
  ) ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            გამარჯობა, {profile.full_name}!
          </h1>
          <p className="text-gray-600 mt-1">თქვენი დავალებები და ისტორია</p>
        </div>
        <Link href="/tasks/new" className="mt-4 sm:mt-0">
          <Button>
            <Plus className="h-4 w-4" />
            ახალი დავალება
          </Button>
        </Link>
      </div>

      {/* Active tasks */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          აქტიური დავალებები ({activeTasks.length})
        </h2>
        {activeTasks.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-500 mb-4">აქტიური დავალებები არ გაქვთ</p>
            <Link href="/tasks/new">
              <Button variant="outline">შექმენი პირველი დავალება</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </section>

      {/* History */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          ისტორია ({historyTasks.length})
        </h2>
        {historyTasks.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-gray-500">ისტორია ცარიელია</p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {historyTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function TaskCard({ task }: { task: Task }) {
  return (
    <Link href={`/tasks/${task.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{task.category?.icon || "🔧"}</span>
            <div>
              <h3 className="font-semibold text-gray-900 line-clamp-1">{task.title}</h3>
              <p className="text-xs text-gray-500">{task.category?.name_ka}</p>
            </div>
          </div>
          <StatusBadge status={task.status} />
        </div>
        <div className="space-y-1 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {task.district}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {formatRelativeTime(task.created_at)}
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
          <span className="text-lg font-bold text-primary-600">
            {formatGEL(task.estimated_price)}
          </span>
        </div>
      </Card>
    </Link>
  );
}
