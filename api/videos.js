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
      const visited = new Set()
      const queue = ['', 'uploads']
      while (queue.length) {
        const prefix = queue.shift()
        const keyPrefix = prefix || ''
        if (visited.has(keyPrefix)) continue
        visited.add(keyPrefix)
        const { data, error } = await supabase
          .storage
          .from(bucket)
          .list(prefix, { limit: 1000, sortBy: { column: 'updated_at', order: 'desc' } })
        if (error || !Array.isArray(data)) continue
        for (const item of data) {
          const name = item.name || ''
          const next = prefix ? `${prefix}/${name}` : name
          const lower = name.toLowerCase()
          const isVideo = lower.endsWith('.mp4') || lower.endsWith('.webm')
          if (isVideo) {
            const path = next
            collected.push({ ...item, name: path, path })
          } else {
            queue.push(next)
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
        const mp4Path = f.path || name
        const filenameOnly = name.includes('/') ? name.split('/').pop() : name
        const baseId = filenameOnly.replace(/\.(mp4|webm)$/i, '')
        const thumb = files.find(t => {
          const tname = t.name || ''
          const tfile = tname.includes('/') ? tname.split('/').pop() : tname
          return tfile.startsWith(baseId) && tfile.includes('thumbnail')
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
          id: baseId,
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
