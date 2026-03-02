import { getSupabase } from '@/supabase';
import { storage } from '@/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export async function UploadFile(input, pathPrefix = 'uploads') {
  const file = input?.file ?? input
  if (!file) throw new Error('No file provided')
  const supabase = getSupabase()
  const filename = `${Date.now()}_${file.name || 'file'}`
  const path = `${pathPrefix}/${filename}`
  if (supabase) {
    const bucket = import.meta.env.VITE_SUPABASE_BUCKET || 'videos'
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false })
    if (error) throw error
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return { file_url: data.publicUrl, path, name: filename }
  } else {
    const storageRef = ref(storage, path)
    const metadata = { contentType: file.type || 'application/octet-stream' }
    await new Promise((resolve, reject) => {
      const task = uploadBytesResumable(storageRef, file, metadata)
      task.on('state_changed', null, reject, resolve)
    })
    const url = await getDownloadURL(storageRef)
    return { file_url: url, path, name: filename }
  }
}

export async function CreateFileSignedUrl(path) {
  const supabase = getSupabase()
  if (supabase) {
    const bucket = import.meta.env.VITE_SUPABASE_BUCKET || 'videos'
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return { url: data.publicUrl }
  } else {
    const storageRef = ref(storage, path)
    const url = await getDownloadURL(storageRef)
    return { url }
  }
}

export default {
  UploadFile,
  CreateFileSignedUrl
};
