export async function updateCategory(categoryIdOrFormData: string | FormData, maybeFormData?: FormData) {
  const supabase = await createClient();
  let categoryId: string;
  let formData: FormData;

  if (categoryIdOrFormData instanceof FormData) {
    formData = categoryIdOrFormData;
    categoryId = formData.get('category_id') as string;
  } else {
    categoryId = categoryIdOrFormData;
    formData = maybeFormData!;
  }

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