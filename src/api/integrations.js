import { getSupabase } from '@/supabase';

export async function UploadFile(input, pathPrefix = 'uploads') {
  const file = input?.file ?? input
  if (!file) throw new Error('No file provided')
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase env vars missing')
  const bucket = import.meta.env.VITE_SUPABASE_BUCKET || 'videos'
  const filename = `${Date.now()}_${file.name || 'file'}`
  const path = `${pathPrefix}/${filename}`
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false })
  if (error) throw error
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return { file_url: data.publicUrl, path, name: filename }
}

export async function CreateFileSignedUrl(path) {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase env vars missing')
  const bucket = import.meta.env.VITE_SUPABASE_BUCKET || 'videos'
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return { url: data.publicUrl }
}

export default {
  UploadFile,
  CreateFileSignedUrl
};
