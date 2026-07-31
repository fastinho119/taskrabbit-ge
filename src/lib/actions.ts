'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { calculatePriceEstimate } from '@/config/pricing';
import type { ComplexityLevel } from '@/config/pricing';

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

  // Fetch category to get its slug for price calculation
  const { data: categoryData, error: catError } = await supabase
    .from('categories')
    .select('*')
    .eq('id', category_id)
    .single();

  if (catError || !categoryData) {
    return { error: 'კატეგორია ვერ მოიძებნა.' };
  }

  // Explicit type assertion to prevent TypeScript compilation errors (never type)
  const category = categoryData as { slug: string; [key: string]: any };

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