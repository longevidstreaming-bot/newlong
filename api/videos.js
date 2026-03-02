import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  const bucket = process.env.SUPABASE_BUCKET || 'videos'
  if (!url || !key) {
    return res.status(500).json({ error: 'Supabase env vars missing' })
  }
  const supabase = createClient(url, key)
  try {
    const gatherFiles = async () => {
      const collected = []
      const { data: uploads, error: errUploads } = await supabase
        .storage
        .from(bucket)
        .list('uploads', { limit: 1000, sortBy: { column: 'updated_at', order: 'desc' } })
      if (!errUploads && Array.isArray(uploads) && uploads.length > 0) {
        collected.push(...uploads.map(f => ({ ...f, name: f.name, path: `uploads/${f.name}` })))
      }
      if (collected.length === 0) {
        const { data: root, error: errRoot } = await supabase
          .storage
          .from(bucket)
          .list('', { limit: 1000, sortBy: { column: 'updated_at', order: 'desc' } })
        if (!errRoot && Array.isArray(root)) {
          const leafFiles = root.filter(f => f.name?.toLowerCase().endsWith('.mp4') || f.name?.toLowerCase().endsWith('.webm'))
          collected.push(...leafFiles.map(f => ({ ...f, name: f.name, path: f.name })))
          const folders = root.filter(f => f.id && !f.name?.toLowerCase().endsWith('.mp4') && !f.name?.toLowerCase().endsWith('.webm'))
          for (const folder of folders) {
            const { data: sub } = await supabase.storage.from(bucket).list(folder.name, { limit: 1000 })
            const subFiles = Array.isArray(sub) ? sub : []
            collected.push(...subFiles.map(sf => ({ ...sf, name: `${folder.name}/${sf.name}`, path: `${folder.name}/${sf.name}` })))
          }
        }
      }
      return collected
    }
    const files = await gatherFiles()
    const videos = []
    for (const f of files || []) {
      const name = f.name || ''
      const lower = name.toLowerCase()
      if (lower.endsWith('.mp4') || lower.endsWith('.webm')) {
        const id = name.split('_')[0]
        const mp4Path = f.path || name
        const filenameOnly = name.includes('/') ? name.split('/').pop() : name
        const thumb = files.find(t => {
          const tname = t.name || ''
          const tfile = tname.includes('/') ? tname.split('/').pop() : tname
          return tfile.startsWith(id) && tfile.includes('thumbnail')
        })
        const thumbPath = thumb ? (thumb.path || thumb.name) : null
        const title = filenameOnly.replace(/^\d+_/, '').replace(/\.(mp4|webm)$/i, '')
        let video_url = null
        let thumbnail_url = null
        try {
          const { data } = await supabase.storage.from(bucket).createSignedUrl(mp4Path, 60 * 60 * 24 * 7)
          video_url = data?.signedUrl || null
        } catch {}
        if (thumbPath) {
          try {
            const { data } = await supabase.storage.from(bucket).createSignedUrl(thumbPath, 60 * 60 * 24 * 7)
            thumbnail_url = data?.signedUrl || null
          } catch {}
        }
        videos.push({
          id,
          title,
          description: '',
          video_url,
          thumbnail_url,
          artist_id: '',
          artist_name: 'longEvid streaming',
          created_date: f.updated_at || new Date().toISOString(),
          category: 'pop',
          views: 0,
          likes: 0,
          is_deleted: false
        })
      }
    }
    return res.status(200).json(videos)
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
