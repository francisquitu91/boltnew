import { supabase } from './supabase';

/**
 * Sube un archivo a Supabase Storage y retorna la URL pública.
 * @param file Archivo a subir
 * @param bucket Nombre del bucket (por ejemplo: 'scenes' o 'logos')
 * @param path Ruta dentro del bucket (por ejemplo: 'userId/filename.png')
 */
export async function uploadToSupabase(file: File, bucket: string, path: string): Promise<string | null> {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
  });
  if (error) {
    console.error('Error uploading to Supabase:', error.message);
    return null;
  }
  // Obtener la URL pública
  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(path);
  return publicUrlData?.publicUrl || null;
}
