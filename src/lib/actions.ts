'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { calculatePriceEstimate } from '@/config/pricing';
import type { ComplexityLevel } from '@/config/pricing';
import type { Category } from '@/types';

// ==================== AUTH ACTIONS ====================

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: error.message };
  }
  revalidatePath('/');
  return { success: true };
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('full_name') as string;
  const role = (formData.get('role') as string) || 'client';

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role },
    },
  });
  if (error) {
    return { error: error.message };
  }
  revalidatePath('/');
  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/');
  return { success: true };
}

// ==================== PHOTO & TASK ACTIONS ====================

export async function uploadTaskPhoto(formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) {
    return { error: 'ფაილი ვერ მოიძებნა' };
  }

  const supabase = await createClient();
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
  const filePath = `tasks/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('task-photos')
    .upload(filePath, file);

  if (uploadError) {
    return { error: uploadError.message };
  }

  const { data: { publicUrl } } = supabase.storage
    .from('task-photos')
    .getPublicUrl(filePath);

  return { url: publicUrl };
}

export async function createTask(formData: FormData) {
  const supabase = await createClient();

  const category_id = formData.get('category_id') as string;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const address = formData.get('address') as string;
  const district = formData.get('district') as string;
  const complexity = (formData.get('complexity') as ComplexityLevel) || 'simple';
  const estimatedHours = parseFloat(formData.get('estimated_hours') as string) || 1;
  const photo_url = formData.get('photo_url') as string;

  if (!category_id || !title || !description || !address || !district) {
    return { error: 'გთხოვთ შეავსოთ ყველა სავალდებულო ველი.' };
  }

  const { data: categoryData, error: catError } = await supabase
    .from('categories')
    .select('*')
    .eq('id', category_id)
    .single();

  if (catError || !categoryData) {
    return { error: 'კატეგორია ვერ მოიძებნა.' };
  }

  // Type assertion using Category interface instead of 'any'
  const category = categoryData as Category;

  const estimate = calculatePriceEstimate({
    categorySlug: category.slug,
    complexity,
    estimatedHours,
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'ავტორიზაცია სავალდებულოა.' };
  }

  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .insert({
      category_id,
      client_id: user.id,
      title,
      description,
      address,
      district,
      complexity,
      estimated_hours: estimatedHours,
      estimated_total: estimate.estimatedTotal,
      commission: estimate.commission,
      tasker_payout: estimate.taskerPayout,
      photo_url: photo_url || null,
      status: 'open',
    })
    .select()
    .single();

  if (taskError) {
    return { error: taskError.message };
  }

  revalidatePath('/tasks');
  return { data: task };
}

export async function acceptTask(taskId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'ავტორიზაცია სავალდებულოა.' };

  const { error } = await supabase
    .from('tasks')
    .update({ handyman_id: user.id, status: 'assigned' })
    .eq('id', taskId);

  if (error) return { error: error.message };
  revalidatePath(`/tasks/${taskId}`);
  revalidatePath('/tasks');
  return { success: true };
}

export async function updateTaskStatus(taskId: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('tasks')
    .update({ status })
    .eq('id', taskId);

  if (error) return { error: error.message };
  revalidatePath(`/tasks/${taskId}`);
  revalidatePath('/tasks');
  return { success: true };
}

export async function submitReview(formData: FormData) {
  const supabase = await createClient();
  const taskId = formData.get('task_id') as string;
  const rating = parseInt(formData.get('rating') as string, 10);
  const comment = formData.get('comment') as string;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'ავტორიზაცია სავალდებულოა.' };

  const { error } = await supabase.from('reviews').insert({
    task_id: taskId,
    reviewer_id: user.id,
    rating,
    comment,
  });

  if (error) return { error: error.message };
  revalidatePath(`/tasks/${taskId}`);
  return { success: true };
}

// ==================== ADMIN ACTIONS ====================

export async function updateCategory(categoryId: string, formData: FormData) {
  const supabase = await createClient();
  const name_ka = formData.get('name_ka') as string;
  const base_price = parseFloat(formData.get('base_price') as string);

  const { error } = await supabase
    .from('categories')
    .update({ name_ka, base_price })
    .eq('id', categoryId);

  if (error) return { error: error.message };
  revalidatePath('/admin');
  return { success: true };
}

export async function updatePlatformSettings(formData: FormData) {
  const supabase = await createClient();
  const commission_rate = parseFloat(formData.get('commission_rate') as string);

  const { error } = await supabase
    .from('settings')
    .update({ commission_rate })
    .eq('id', 1);

  if (error) return { error: error.message };
  revalidatePath('/admin');
  return { success: true };
}