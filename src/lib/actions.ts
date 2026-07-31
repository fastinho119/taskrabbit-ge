"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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

  const { error } = await supabase
    .from("tasks")
    .insert({
      category_id,
      client_id: user.id,
      title,
      description,
    } as any);

  if (error) {
    throw new Error(error.message);
  }

  redirect("/tasks");
}