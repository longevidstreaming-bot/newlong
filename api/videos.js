export default async function handler(req, res) {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    const bucket = process.env.SUPABASE_BUCKET || process.env.VITE_SUPABASE_BUCKET || 'videos'
    if (!url || !key) {
      const missing = []
      if (!url) missing.push('SUPABASE_URL')
      if (!key) missing.push('SUPABASE_SERVICE_ROLE_KEY')
      return res.status(503).json({ error: 'Supabase env vars missing', missing })
    }
    const supabase = createClient(url, key)
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
        if (error) {
          // Continue to next prefix if folder listing fails
          continue
        }
        if (!Array.isArray(data)) continue
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
        // Encontrar capa: prioriza *_thumbnail.*; se não houver, qualquer imagem que comece com baseId
        const imageExt = /\.(png|jpe?g|webp|gif|bmp)$/i
        let thumbCandidate = files.find(t => {
          const tname = t.name || ''
          const tfile = tname.includes('/') ? tname.split('/').pop() : tname
          return tfile.startsWith(baseId) && /thumbnail|thumb/i.test(tfile) && imageExt.test(tfile)
        })
        if (!thumbCandidate) {
          thumbCandidate = files.find(t => {
            const tname = t.name || ''
            const tfile = tname.includes('/') ? tname.split('/').pop() : tname
            return tfile.startsWith(baseId) && imageExt.test(tfile)
          })
        }
        const thumbPath = thumbCandidate ? (thumbCandidate.path || thumbCandidate.name) : null
        const title = filenameOnly
          .replace(/^\d+_/, '')
          .replace(/\.(mp4|webm)$/i, '')
          .replace(/[_-]+/g, ' ')
          .trim()
        let video_url = null
        let thumbnail_url = null
        {
          const { data, error } = await supabase.storage.from(bucket).createSignedUrl(mp4Path, 60 * 60 * 24 * 7)
          if (!error) video_url = data?.signedUrl || null
        }
        if (thumbPath) {
          const { data, error } = await supabase.storage.from(bucket).createSignedUrl(thumbPath, 60 * 60 * 24 * 7)
          if (!error) thumbnail_url = data?.signedUrl || null
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
    return res.status(500).json({ error: e?.message || 'Internal error' })
  }
}
