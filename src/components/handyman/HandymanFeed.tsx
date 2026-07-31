"use client";

import { useState } from "react";
import Link from "next/link";
import { acceptTask } from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/ui/Badge";
import { formatGEL } from "@/config/pricing";
import { formatRelativeTime } from "@/lib/utils";
import { TBILISI_DISTRICTS } from "@/config/pricing";
import type { Task, Category } from "@/types";
import { MapPin, Clock, List, Map } from "lucide-react";

interface HandymanFeedProps {
  availableTasks: Task[];
  myTasks: Task[];
  categories: Category[];
  handymanDistrict: string | null;
}

export function HandymanFeed({
  availableTasks: initialAvailable,
  myTasks,
  categories,
  handymanDistrict,
}: HandymanFeedProps) {
  const [view, setView] = useState<"list" | "map">("list");
  const [districtFilter, setDistrictFilter] = useState(handymanDistrict || "");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = initialAvailable.filter((t) => {
    if (districtFilter && t.district !== districtFilter) return false;
    if (categoryFilter && t.category_id !== categoryFilter) return false;
    return true;
  });

  async function handleAccept(taskId: string) {
    setLoadingId(taskId);
    await acceptTask(taskId);
    setLoadingId(null);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ხელმისაწვდომი სამუშაოები</h1>
          <p className="text-gray-600 mt-1">
            {filtered.length} დავალება ხელმისაწვდომია
          </p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Button
            variant={view === "list" ? "primary" : "outline"}
            size="sm"
            onClick={() => setView("list")}
          >
            <List className="h-4 w-4" />
            სია
          </Button>
          <Button
            variant={view === "map" ? "primary" : "outline"}
            size="sm"
            onClick={() => setView("map")}
          >
            <Map className="h-4 w-4" />
            რუკა
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Select
          id="district-filter"
          value={districtFilter}
          onChange={(e) => setDistrictFilter(e.target.value)}
          options={[
            { value: "", label: "ყველა რაიონი" },
            ...TBILISI_DISTRICTS.map((d) => ({ value: d, label: d })),
          ]}
          className="sm:w-48"
        />
        <Select
          id="category-filter"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          options={[
            { value: "", label: "ყველა კატეგორია" },
            ...categories.map((c) => ({ value: c.id, label: `${c.icon} ${c.name_ka}` })),
          ]}
          className="sm:w-56"
        />
      </div>

      {view === "map" ? (
        <Card className="py-16 text-center">
          <Map className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">რუკის ხედი</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            რუკის ინტეგრაცია (Google Maps / OpenStreetMap) მზადაა დასაკავშირებლად.
            ამჟამად გამოიყენეთ სიის ხედი.
          </p>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-2 max-w-lg mx-auto text-left">
            {filtered.map((task) => (
              <div key={task.id} className="text-xs p-2 bg-gray-50 rounded-lg">
                <span className="font-medium">{task.category?.icon} {task.district}</span>
                <span className="block text-primary-600 font-bold">{formatGEL(task.estimated_price)}</span>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <>
          {filtered.length === 0 ? (
            <Card className="text-center py-12">
              <p className="text-gray-500">ახლა ხელმისაწვდომი დავალებები არ არის</p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((task) => (
                <Card key={task.id} className="flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{task.category?.icon || "🔧"}</span>
                      <div>
                        <Link href={`/tasks/${task.id}`}>
                          <h3 className="font-semibold text-gray-900 hover:text-primary-600 line-clamp-1">
                            {task.title}
                          </h3>
                        </Link>
                        <p className="text-xs text-gray-500">{task.category?.name_ka}</p>
                      </div>
                    </div>
                    <StatusBadge status={task.status} />
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3 flex-1">
                    {task.description}
                  </p>
                  <div className="space-y-1 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {task.district}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatRelativeTime(task.created_at)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-lg font-bold text-primary-600">
                      {formatGEL(task.estimated_price)}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => handleAccept(task.id)}
                      loading={loadingId === task.id}
                    >
                      მიღება
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* My active tasks */}
      {myTasks.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            ჩემი დავალებები ({myTasks.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {myTasks.map((task) => (
              <Link key={task.id} href={`/tasks/${task.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{task.category?.icon}</span>
                      <span className="font-medium">{task.title}</span>
                    </div>
                    <StatusBadge status={task.status} />
                  </div>
                  <div className="mt-2 text-sm text-primary-600 font-bold">
                    {formatGEL(task.estimated_price)}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
