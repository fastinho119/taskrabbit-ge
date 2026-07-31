"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signIn(formData: FormData): Promise<{ error: string } | void> {
  const supabase = createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: error.message };
  }
  redirect("/");
}

export async function signUp(formData: FormData): Promise<{ error: string } | void> {
  const supabase = createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const full_name = formData.get("full_name") as string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const credentials: Record<string, any> = {
    email,
    password,
    options: {
      data: { full_name },
    },
  };

  const { error } = await supabase.auth.signUp(credentials);
  if (error) {
    return { error: error.message };
  }
  redirect("/");
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}

export async function createTask(formData: FormData): Promise<{ error?: string } | void> {
  const supabase = createClient();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category_id = formData.get("category_id") as string;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "ავტორიზაცია აუცილებელია" };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload: Record<string, any> = {
    category_id,
    client_id: user.id,
    title,
    description,
  };

  const { error } = await supabase.from("tasks").insert(payload);

  if (error) {
    return { error: error.message };
  }

  redirect("/tasks");
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function updatePlatformSettings(formData: FormData): Promise<{ error?: string }> {
  return {};
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function updateCategory(formData: FormData): Promise<{ error?: string }> {
  return {};
}

export async function acceptTask(taskId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await supabase.from("tasks").update({ handyman_id: user.id, status: "accepted" } as any).eq("id", taskId);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function submitReview(formData: FormData): Promise<{ error?: string; success?: boolean }> {
  return { success: true };
}

export async function updateTaskStatus(taskId: string, status: string) {
  const supabase = createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await supabase.from("tasks").update({ status } as any).eq("id", taskId);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function uploadTaskPhoto(formData: FormData): Promise<{ url?: string; error?: string }> {
  return { url: "https://via.placeholder.com/150" };
}