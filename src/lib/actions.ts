"use server";

import { createClient } from "@/lib/supabase/server";
import { calculatePriceEstimate } from "@/config/pricing";
import { notifyNewTask, notifyTaskAccepted, notifyTaskCompleted, notifyNewReview } from "@/lib/telegram";
import { revalidatePath } from "next/cache";
import type { ComplexityLevel } from "@/config/pricing";

export async function createTask(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const categoryId = formData.get("category_id") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const address = formData.get("address") as string;
  const district = formData.get("district") as string;
  const complexity = (formData.get("complexity") as ComplexityLevel) || "simple";
  const estimatedHours = parseFloat(formData.get("estimated_hours") as string) || 1;
  const photoUrl = formData.get("photo_url") as string | null;

  const { data: category } = await supabase
    .from("categories")
    .select("slug, name_ka")
    .eq("id", categoryId)
    .single();

  if (!category) return { error: "Category not found" };

  const estimate = calculatePriceEstimate({
    categorySlug: category.slug,
    complexity,
    estimatedHours,
  });

  const { data: task, error } = await supabase
    .from("tasks")
    .insert({
      customer_id: user.id,
      category_id: categoryId,
      title,
      description,
      address,
      district,
      photo_url: photoUrl,
      complexity,
      estimated_hours: estimatedHours,
      estimated_price: estimate.estimatedTotal,
      commission_amount: estimate.commission,
      tasker_payout: estimate.taskerPayout,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  await notifyNewTask({
    id: task.id,
    title,
    district,
    categoryName: category.name_ka,
    estimatedPrice: estimate.estimatedTotal,
  });

  revalidatePath("/dashboard");
  return { data: task };
}

export async function acceptTask(taskId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "handyman" && profile?.role !== "admin") {
    return { error: "Only handymen can accept tasks" };
  }

  const { data: task, error } = await supabase
    .from("tasks")
    .update({
      handyman_id: user.id,
      status: "accepted",
      accepted_at: new Date().toISOString(),
    })
    .eq("id", taskId)
    .eq("status", "pending")
    .select("id, title")
    .single();

  if (error) return { error: error.message };

  await notifyTaskAccepted({
    id: task.id,
    title: task.title,
    handymanName: profile?.full_name || "Handyman",
  });

  revalidatePath(`/tasks/${taskId}`);
  revalidatePath("/handyman");
  return { data: task };
}

export async function updateTaskStatus(
  taskId: string,
  status: "in_progress" | "completed" | "cancelled"
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const updates: Record<string, unknown> = { status };

  if (status === "completed") {
    updates.completed_at = new Date().toISOString();
    const { data: existingTask } = await supabase
      .from("tasks")
      .select("estimated_price, title, handyman_id, profiles:handyman_id(full_name)")
      .eq("id", taskId)
      .single();

    if (existingTask) {
      updates.final_price = existingTask.estimated_price;

      const handyman = existingTask.profiles as unknown as { full_name: string } | null;
      await notifyTaskCompleted({
        id: taskId,
        title: existingTask.title,
        handymanName: handyman?.full_name || "Handyman",
        finalPrice: existingTask.estimated_price,
      });
    }
  }

  const { error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", taskId);

  if (error) return { error: error.message };

  revalidatePath(`/tasks/${taskId}`);
  revalidatePath("/dashboard");
  revalidatePath("/handyman");
  return { success: true };
}

export async function submitReview(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const taskId = formData.get("task_id") as string;
  const handymanId = formData.get("handyman_id") as string;
  const rating = parseInt(formData.get("rating") as string);
  const comment = formData.get("comment") as string;

  const { error } = await supabase.from("reviews").insert({
    task_id: taskId,
    customer_id: user.id,
    handyman_id: handymanId,
    rating,
    comment: comment || null,
  });

  if (error) return { error: error.message };

  const { data: handyman } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", handymanId)
    .single();

  await notifyNewReview({
    taskId,
    handymanName: handyman?.full_name || "Handyman",
    rating,
  });

  revalidatePath(`/tasks/${taskId}`);
  return { success: true };
}

export async function uploadTaskPhoto(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const file = formData.get("file") as File;
  if (!file) return { error: "No file provided" };

  const ext = file.name.split(".").pop();
  const fileName = `${user.id}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("task-photos")
    .upload(fileName, file);

  if (uploadError) return { error: uploadError.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from("task-photos").getPublicUrl(fileName);

  return { url: publicUrl };
}

export async function updatePlatformSettings(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return { error: "Unauthorized" };

  const { error } = await supabase
    .from("platform_settings")
    .update({
      commission_percent: parseFloat(formData.get("commission_percent") as string),
      min_task_price: parseFloat(formData.get("min_task_price") as string),
      max_task_price: parseFloat(formData.get("max_task_price") as string),
      platform_name: formData.get("platform_name") as string,
      support_email: formData.get("support_email") as string,
      support_phone: formData.get("support_phone") as string,
    })
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (error) return { error: error.message };

  revalidatePath("/admin");
  return { success: true };
}

export async function updateCategory(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const id = formData.get("id") as string;
  const { error } = await supabase
    .from("categories")
    .update({
      name_ka: formData.get("name_ka") as string,
      name_en: formData.get("name_en") as string,
      base_price: parseFloat(formData.get("base_price") as string),
      is_active: formData.get("is_active") === "true",
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin");
  return { success: true };
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("full_name") as string;
  const role = formData.get("role") as "customer" | "handyman";
  const phone = formData.get("phone") as string;
  const district = formData.get("district") as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role },
    },
  });

  if (error) return { error: error.message };

  if (role === "handyman" && district) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("profiles")
        .update({ phone, district })
        .eq("id", user.id);
    }
  }

  return { success: true };
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
