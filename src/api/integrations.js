import { getSupabase } from '@/supabase';
// Firebase Storage não é usado para upload

function sanitizeName(name) {
  return String(name || 'file')
    .replace(/[^\w\s.-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 120)
}

export async function UploadFile(input, pathPrefix = 'uploads', desiredName) {
  const file = input?.file ?? input
  if (!file) throw new Error('No file provided')
  const supabase = getSupabase()
  const original = file.name || 'file'
  const ext = original.includes('.') ? '.' + original.split('.').pop() : ''
  const base = desiredName ? sanitizeName(desiredName) : sanitizeName(original.replace(/\.[^/.]+$/, ''))
  const filename = `${Date.now()}_${base}${ext}`
  const path = `${pathPrefix}/${filename}`
  if (!supabase) throw new Error('Supabase não configurado')
  const bucket = import.meta.env.VITE_SUPABASE_BUCKET || 'videos'
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false })
  if (error) throw error
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return { file_url: data.publicUrl, path, name: filename }
}

export async function CreateFileSignedUrl(path) {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase não configurado')
  const bucket = import.meta.env.VITE_SUPABASE_BUCKET || 'videos'
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return { url: data.publicUrl }
}

export default {
  UploadFile,
  CreateFileSignedUrl
};
