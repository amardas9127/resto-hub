import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️  Supabase credentials missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

/**
 * Uploads an image file to Supabase storage bucket 'menu-items'.
 * Falls back to Base64 Data URL if storage bucket is unavailable.
 */
export async function uploadMenuImage(file) {
  if (!file) return null;
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

  try {
    const { data, error } = await supabase.storage
      .from('menu-items')
      .upload(fileName, file, { cacheControl: '3600', upsert: true });

    if (!error && data) {
      const { data: publicData } = supabase.storage
        .from('menu-items')
        .getPublicUrl(fileName);
      return publicData.publicUrl;
    }
  } catch (err) {
    console.warn('Storage upload fallback:', err);
  }

  // Fallback: Base64 Data URL for offline / local demo
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Deletes an image from Supabase storage if it was stored in the 'menu-items' bucket.
 */
export async function deleteMenuImage(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') return;
  if (!imageUrl.includes('/storage/v1/object/public/menu-items/')) return;

  try {
    const fileName = imageUrl.split('/storage/v1/object/public/menu-items/').pop();
    if (fileName) {
      await supabase.storage.from('menu-items').remove([fileName]);
    }
  } catch (err) {
    console.warn('Storage delete error:', err);
  }
}
