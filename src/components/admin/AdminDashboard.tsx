"use client";

import { useState } from "react";
import { updatePlatformSettings, updateCategory } from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { formatGEL } from "@/config/pricing";
import { formatDate } from "@/lib/utils";
import type { Category, PlatformSettings, Profile, Task } from "@/types";
import { Users, Wrench, Settings, BarChart3 } from "lucide-react";

interface AdminDashboardProps {
  settings: PlatformSettings;
  categories: Category[];
  users: Profile[];
  tasks: Task[];
  stats: {
    totalUsers: number;
    totalTasks: number;
    completedTasks: number;
    totalRevenue: number;
  };
}

export function AdminDashboard({
  settings,
  categories,
  users,
  tasks,
  stats,
}: AdminDashboardProps) {
  const [tab, setTab] = useState<"overview" | "categories" | "users" | "tasks" | "settings">(
    "overview"
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSettingsSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await updatePlatformSettings(formData);
    setMessage(result.error || "შენახულია!");
    setLoading(false);
  }

  async function handleCategorySubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await updateCategory(formData);
    setMessage(result.error || "კატეგორია განახლდა!");
    setLoading(false);
  }

  const tabs = [
    { id: "overview" as const, label: "მიმოხილვა", icon: BarChart3 },
    { id: "categories" as const, label: "კატეგორიები", icon: Wrench },
    { id: "users" as const, label: "მომხმარებლები", icon: Users },
    { id: "tasks" as const, label: "დავალებები", icon: Wrench },
    { id: "settings" as const, label: "პარამეტრები", icon: Settings },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">ადმინისტრაცია</h1>

      {message && (
        <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</div>
      )}

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map((t) => (
          <Button
            key={t.id}
            variant={tab === t.id ? "primary" : "outline"}
            size="sm"
            onClick={() => { setTab(t.id); setMessage(""); }}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </Button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="მომხმარებლები" value={stats.totalUsers.toString()} />
          <StatCard label="დავალებები" value={stats.totalTasks.toString()} />
          <StatCard label="დასრულებული" value={stats.completedTasks.toString()} />
          <StatCard label="შემოსავალი (₾)" value={formatGEL(stats.totalRevenue)} />
        </div>
      )}

      {tab === "categories" && (
        <div className="space-y-4">
          {categories.map((cat) => (
            <Card key={cat.id}>
              <form onSubmit={handleCategorySubmit} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                <input type="hidden" name="id" value={cat.id} />
                <Input name="name_ka" label="სახელი (KA)" defaultValue={cat.name_ka} />
                <Input name="name_en" label="Name (EN)" defaultValue={cat.name_en} />
                <Input name="base_price" label="ბაზის ფასი (₾)" type="number" defaultValue={cat.base_price} />
                <select name="is_active" defaultValue={cat.is_active.toString()} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
                  <option value="true">აქტიური</option>
                  <option value="false">არააქტიური</option>
                </select>
                <Button type="submit" size="sm" loading={loading}>შენახვა</Button>
              </form>
            </Card>
          ))}
        </div>
      )}

      {tab === "users" && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="py-2 px-3">სახელი</th>
                <th className="py-2 px-3">ელ-ფოსტა</th>
                <th className="py-2 px-3">როლი</th>
                <th className="py-2 px-3">რაიონი</th>
                <th className="py-2 px-3">რეიტინგი</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100">
                  <td className="py-2 px-3 font-medium">{user.full_name}</td>
                  <td className="py-2 px-3 text-gray-600">{user.email}</td>
                  <td className="py-2 px-3">
                    <span className="capitalize">{user.role}</span>
                  </td>
                  <td className="py-2 px-3">{user.district || "—"}</td>
                  <td className="py-2 px-3">
                    {user.rating_count > 0 ? `${user.rating_avg} (${user.rating_count})` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "tasks" && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="py-2 px-3">სათაური</th>
                <th className="py-2 px-3">სტატუსი</th>
                <th className="py-2 px-3">რაიონი</th>
                <th className="py-2 px-3">ფასი</th>
                <th className="py-2 px-3">თარიღი</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="border-b border-gray-100">
                  <td className="py-2 px-3 font-medium">{task.title}</td>
                  <td className="py-2 px-3"><StatusBadge status={task.status} /></td>
                  <td className="py-2 px-3">{task.district}</td>
                  <td className="py-2 px-3">{formatGEL(task.estimated_price)}</td>
                  <td className="py-2 px-3 text-gray-500">{formatDate(task.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "settings" && (
        <Card>
          <CardHeader>
            <CardTitle>პლატფორმის პარამეტრები</CardTitle>
          </CardHeader>
          <form onSubmit={handleSettingsSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input name="platform_name" label="პლატფორმის სახელი" defaultValue={settings.platform_name} />
            <Input name="commission_percent" label="საკომისიო (%)" type="number" step="0.1" defaultValue={settings.commission_percent} />
            <Input name="min_task_price" label="მინ. ფასი (₾)" type="number" defaultValue={settings.min_task_price} />
            <Input name="max_task_price" label="მაქს. ფასი (₾)" type="number" defaultValue={settings.max_task_price} />
            <Input name="support_email" label="Support Email" defaultValue={settings.support_email} />
            <Input name="support_phone" label="Support Phone" defaultValue={settings.support_phone} />
            <div className="md:col-span-2">
              <Button type="submit" loading={loading}>შენახვა</Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </Card>
  );
}
