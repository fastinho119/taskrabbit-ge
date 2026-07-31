"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { acceptTask, updateTaskStatus } from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { ReviewForm } from "@/components/tasks/ReviewForm";
import { formatGEL, PLATFORM_COMMISSION_PERCENT } from "@/config/pricing";
import { formatDate } from "@/lib/utils";
import type { Task, Review, Profile } from "@/types";
import { MapPin, Clock, User, Star } from "lucide-react";
import Image from "next/image";

interface TaskDetailProps {
  task: Task;
  review: Review | null;
  currentUser: Profile;
}

export function TaskDetailClient({ task: initialTask, review, currentUser }: TaskDetailProps) {
  const [task, setTask] = useState(initialTask);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel(`task-${task.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "tasks", filter: `id=eq.${task.id}` },
        (payload) => {
          setTask((prev) => ({ ...prev, ...payload.new }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [task.id, supabase]);

  const isCustomer = currentUser.id === task.customer_id;
  const isHandyman = currentUser.id === task.handyman_id;
  const isAdmin = currentUser.role === "admin";
  const canAccept =
    currentUser.role === "handyman" && task.status === "pending" && !task.handyman_id;
  const canUpdateStatus = isHandyman || isAdmin;
  const canReview = isCustomer && task.status === "completed" && !review && task.handyman_id;

  async function handleAccept() {
    setLoading(true);
    await acceptTask(task.id);
    setLoading(false);
  }

  async function handleStatusUpdate(status: "in_progress" | "completed" | "cancelled") {
    setLoading(true);
    await updateTaskStatus(task.id, status);
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-3xl">{task.category?.icon || "🔧"}</span>
            <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
          </div>
          <p className="text-gray-500">{task.category?.name_ka}</p>
        </div>
        <StatusBadge status={task.status} />
      </div>

      {task.photo_url && (
        <div className="mb-6 rounded-xl overflow-hidden relative h-64">
          <Image src={task.photo_url} alt={task.title} fill className="object-cover" />
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>დეტალები</CardTitle>
          </CardHeader>
          <div className="space-y-3 text-sm">
            <p className="text-gray-700">{task.description}</p>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="h-4 w-4" />
              {task.district}, {task.address}
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-4 w-4" />
              {formatDate(task.created_at)}
            </div>
            {task.handyman && (
              <div className="flex items-center gap-2 text-gray-600">
                <User className="h-4 w-4" />
                {task.handyman.full_name}
                {task.handyman.rating_avg > 0 && (
                  <span className="flex items-center gap-1 text-yellow-600">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    {task.handyman.rating_avg.toFixed(1)}
                  </span>
                )}
              </div>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ფინანსები (₾)</CardTitle>
          </CardHeader>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">სავარაუდო ფასი</span>
              <span className="font-bold text-lg text-primary-600">
                {formatGEL(task.final_price ?? task.estimated_price)}
              </span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>პლატფორმის საკომისიო ({PLATFORM_COMMISSION_PERCENT}%)</span>
              <span>{formatGEL(task.commission_amount)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>ხელოსნის შემოსავალი</span>
              <span>{formatGEL(task.tasker_payout)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>სირთულე</span>
              <span>{task.complexity}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>საათები</span>
              <span>{task.estimated_hours}h</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mb-6">
        {canAccept && (
          <Button onClick={handleAccept} loading={loading} size="lg">
            დავალების მიღება
          </Button>
        )}
        {canUpdateStatus && task.status === "accepted" && (
          <Button onClick={() => handleStatusUpdate("in_progress")} loading={loading}>
            სამუშაოს დაწყება
          </Button>
        )}
        {canUpdateStatus && task.status === "in_progress" && (
          <Button onClick={() => handleStatusUpdate("completed")} loading={loading} variant="secondary">
            დასრულება
          </Button>
        )}
        {(isCustomer || isAdmin) && ["pending", "accepted"].includes(task.status) && (
          <Button onClick={() => handleStatusUpdate("cancelled")} loading={loading} variant="danger">
            გაუქმება
          </Button>
        )}
      </div>

      {/* Review */}
      {canReview && task.handyman_id && (
        <ReviewForm taskId={task.id} handymanId={task.handyman_id} />
      )}

      {review && (
        <Card>
          <CardHeader>
            <CardTitle>შეფასება</CardTitle>
          </CardHeader>
          <div className="flex items-center gap-1 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
              />
            ))}
          </div>
          {review.comment && <p className="text-sm text-gray-600">{review.comment}</p>}
        </Card>
      )}
    </div>
  );
}
