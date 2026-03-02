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
    const prefix = 'uploads'
    const { data: files, error } = await supabase
      .storage
      .from(bucket)
      .list(prefix, { limit: 1000, sortBy: { column: 'updated_at', order: 'desc' } })
    if (error) return res.status(500).json({ error: error.message })
    const videos = []
    for (const f of files || []) {
      const name = f.name || ''
      const lower = name.toLowerCase()
      if (lower.endsWith('.mp4') || lower.endsWith('.webm')) {
        const id = name.split('_')[0]
        const mp4Path = `${prefix}/${name}`
        const thumb = files.find(t => t.name.startsWith(id) && t.name.includes('thumbnail'))
        const thumbPath = thumb ? `${prefix}/${thumb.name}` : null
        const title = name.replace(/^\d+_/, '').replace(/\.(mp4|webm)$/i, '')
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
