"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signIn(formData: FormData) {
  const supabase = createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    throw new Error(error.message);
  }
  redirect("/");
}

export async function signUp(formData: FormData) {
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
    throw new Error(error.message);
  }
  redirect("/");
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}

export async function createTask(formData: FormData) {
  const supabase = createClient();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category_id = formData.get("category_id") as string;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("ავტორიზაცია აუცილებელია");
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
    throw new Error(error.message);
  }

  redirect("/tasks");
}

export async function updatePlatformSettings() {
  redirect("/admin");
}

export async function updateCategory() {
  redirect("/admin");
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

export async function submitReview() {
  // Review submission logic
}

export async function updateTaskStatus(taskId: string, status: string) {
  const supabase = createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await supabase.from("tasks").update({ status } as any).eq("id", taskId);
}

export async function uploadTaskPhoto() {
  return "";
}