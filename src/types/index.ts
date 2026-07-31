export type UserRole = "customer" | "handyman" | "admin";

export type TaskStatus =
  | "pending"
  | "accepted"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  district: string | null;
  categories: string[];
  bio: string | null;
  rating_avg: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  slug: string;
  name_ka: string;
  name_en: string;
  icon: string;
  base_price: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Task {
  id: string;
  customer_id: string;
  handyman_id: string | null;
  category_id: string;
  title: string;
  description: string;
  address: string;
  district: string;
  photo_url: string | null;
  status: TaskStatus;
  complexity: "simple" | "moderate" | "complex";
  estimated_hours: number;
  estimated_price: number;
  commission_amount: number;
  tasker_payout: number;
  final_price: number | null;
  created_at: string;
  updated_at: string;
  accepted_at: string | null;
  completed_at: string | null;
  // Joined fields
  category?: Category;
  customer?: Profile;
  handyman?: Profile;
}

export interface Review {
  id: string;
  task_id: string;
  customer_id: string;
  handyman_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  customer?: Profile;
}

export interface PlatformSettings {
  id: string;
  commission_percent: number;
  min_task_price: number;
  max_task_price: number;
  currency: string;
  platform_name: string;
  support_email: string;
  support_phone: string;
  updated_at: string;
}

export const TASK_STATUS_LABELS: Record<TaskStatus, { ka: string; en: string; color: string }> = {
  pending: { ka: "მოლოდინში", en: "Pending", color: "bg-yellow-100 text-yellow-800" },
  accepted: { ka: "მიღებული", en: "Accepted", color: "bg-blue-100 text-blue-800" },
  in_progress: { ka: "მიმდინარე", en: "In Progress", color: "bg-indigo-100 text-indigo-800" },
  completed: { ka: "დასრულებული", en: "Completed", color: "bg-green-100 text-green-800" },
  cancelled: { ka: "გაუქმებული", en: "Cancelled", color: "bg-red-100 text-red-800" },
};

export const TASK_WIZARD_STEPS = [
  { id: "category", label: "კატეგორია", labelEn: "Category" },
  { id: "photo", label: "ფოტო", labelEn: "Photo" },
  { id: "description", label: "აღწერა", labelEn: "Description" },
  { id: "address", label: "მისამართი", labelEn: "Address" },
  { id: "estimate", label: "ფასი", labelEn: "Estimate" },
  { id: "submit", label: "გაგზავნა", labelEn: "Submit" },
] as const;

export type WizardStep = (typeof TASK_WIZARD_STEPS)[number]["id"];
