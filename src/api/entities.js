import { auth, signOutUser, onAuthChanged } from '@/firebase'
import { getSupabase } from '@/supabase'

async function loadCatalog(supabase, bucket) {
  try {
    const { data, error } = await supabase.storage.from(bucket).download('catalog.json')
    if (error) return []
    const text = await data.text()
    const json = JSON.parse(text || '[]')
    return Array.isArray(json) ? json : []
  } catch {
    return []
  }
}

async function saveCatalog(supabase, bucket, items) {
  const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' })
  await supabase.storage.from(bucket).upload('catalog.json', blob, { upsert: true })
}

export const User = {
  async me() {
    if (auth.currentUser) {
      const u = auth.currentUser
      return {
        id: u.uid,
        full_name: u.displayName || u.email || 'Usuário',
        email: u.email || '',
        role: 'user'
      }
    }
    return new Promise((resolve) => {
      const unsub = onAuthChanged((u) => {
        unsub()
        if (u) {
          resolve({
            id: u.uid,
            full_name: u.displayName || u.email || 'Usuário',
            email: u.email || '',
            role: 'user'
          })
        } else {
          resolve(null)
        }
      })
      setTimeout(() => { try { unsub() } catch {} ; resolve(null) }, 600)
    })
  },
  async logout() {
    await signOutUser()
    return true
  },
  async update(id, data) {
    return { id, ...data }
  },
  async filter(criteria = {}, order = '-created_date', limit = 8) {
    const videos = await Video.filter()
    const map = new Map()
    videos.forEach(v => {
      const id = v.artist_id || 'unknown'
      if (!map.has(id)) {
        map.set(id, {
          id,
          artist_name: v.artist_name || 'Artista',
          artist_avatar: v.thumbnail_url || '',
          artist_bio: '',
          created_date: v.created_date
        })
      }
    })
    let list = Array.from(map.values())
    if (criteria?.role === 'artist') {
      // already only artists inferred from vídeos
    }
    list = list.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    if (typeof limit === 'number') list = list.slice(0, limit)
    return list
  },
  async get(id) {
    const videos = await Video.filter()
    const fromVideo = videos.find(v => String(v.artist_id) === String(id))
    if (fromVideo) {
      return {
        id: String(id),
        artist_name: fromVideo.artist_name || 'Artista',
        artist_avatar: fromVideo.thumbnail_url || '',
        artist_bio: '',
        social_links: {}
      }
    }
    if (auth.currentUser && String(auth.currentUser.uid) === String(id)) {
      return {
        id: auth.currentUser.uid,
        artist_name: auth.currentUser.displayName || auth.currentUser.email || 'Usuário',
        artist_avatar: '',
        artist_bio: '',
        social_links: {}
      }
    }
    return null
  }
}

export const Video = {
  async filter() {
    const supabase = getSupabase()
    if (supabase) {
      const bucket = import.meta.env.VITE_SUPABASE_BUCKET || 'videos'
      const catalog = await loadCatalog(supabase, bucket)
      if (catalog.length > 0) {
        return catalog.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description || '',
          video_url: item.video_url,
          thumbnail_url: item.thumbnail_url || '',
          artist_id: item.artist_id || '',
          artist_name: item.artist_name || 'longEvid streaming',
          created_date: item.created_date || new Date().toISOString(),
          category: item.category || 'pop',
          views: item.views || 0,
          likes: item.likes || 0,
          is_deleted: !!item.is_deleted
        }))
      }
      const { data } = await supabase.storage.from(bucket).list('uploads', { limit: 1000 })
      const files = Array.isArray(data) ? data : []
      const videos = files
        .filter(f => f.name.toLowerCase().endsWith('.mp4') || f.name.toLowerCase().endsWith('.webm'))
        .map(f => {
          const prefix = f.name.split('_')[0]
          const mp4Path = `uploads/${f.name}`
          const thumb = files.find(t => t.name.startsWith(prefix) && t.name.includes('thumbnail'))
          const thumbPath = thumb ? `uploads/${thumb.name}` : null
          const mp4Url = supabase.storage.from(bucket).getPublicUrl(mp4Path).data.publicUrl
          const thumbUrl = thumbPath ? supabase.storage.from(bucket).getPublicUrl(thumbPath).data.publicUrl : null
          const title = f.name.replace(/^\d+_/, '').replace(/\.(mp4|webm)$/i, '')
          return {
            id: prefix,
            title,
            description: '',
            video_url: mp4Url,
            thumbnail_url: thumbUrl,
            artist_id: auth.currentUser?.uid || '',
            artist_name: auth.currentUser?.displayName || 'longEvid streaming',
            created_date: f.updated_at || new Date().toISOString(),
            category: 'pop',
            views: 0,
            likes: 0,
            is_deleted: false
          }
        })
      return videos
    }
    try {
      const raw = localStorage.getItem('videos') || '[]'
      return JSON.parse(raw)
    } catch {
      return []
    }
  },
  async get(id) {
    const supabase = getSupabase()
    if (supabase) {
      const bucket = import.meta.env.VITE_SUPABASE_BUCKET || 'videos'
      const catalog = await loadCatalog(supabase, bucket)
      const byId = catalog.find(v => String(v.id) === String(id))
      if (byId) {
        return {
          id: String(byId.id),
          title: byId.title,
          description: byId.description || '',
          video_url: byId.video_url,
          thumbnail_url: byId.thumbnail_url || '',
          artist_id: byId.artist_id || '',
          artist_name: byId.artist_name || 'longEvid streaming',
          created_date: byId.created_date || new Date().toISOString(),
          category: byId.category || 'pop',
          views: byId.views || 0,
          likes: byId.likes || 0,
          is_deleted: !!byId.is_deleted
        }
      }
      const { data } = await supabase.storage.from(bucket).list('uploads', { limit: 1000 })
      const files = Array.isArray(data) ? data : []
      const base = files.find(f => f.name.startsWith(`${id}_`) && (f.name.endsWith('.mp4') || f.name.endsWith('.webm')))
      if (!base) return null
      const mp4Path = `uploads/${base.name}`
      const thumb = files.find(t => t.name.startsWith(`${id}_`) && t.name.includes('thumbnail'))
      const thumbPath = thumb ? `uploads/${thumb.name}` : null
      const mp4Url = supabase.storage.from(bucket).getPublicUrl(mp4Path).data.publicUrl
      const thumbUrl = thumbPath ? supabase.storage.from(bucket).getPublicUrl(thumbPath).data.publicUrl : null
      const title = base.name.replace(/^\d+_/, '').replace(/\.(mp4|webm)$/i, '')
      return {
        id: String(id),
        title,
        description: '',
        video_url: mp4Url,
        thumbnail_url: thumbUrl,
        artist_id: auth.currentUser?.uid || '',
        artist_name: auth.currentUser?.displayName || 'longEvid streaming',
        created_date: base.updated_at || new Date().toISOString(),
        category: 'pop',
        views: 0,
        likes: 0,
        is_deleted: false
      }
    }
    try {
      const raw = localStorage.getItem('videos') || '[]'
      const list = JSON.parse(raw)
      return list.find(v => String(v.id) === String(id)) || null
    } catch {
      return null
    }
  },
  async create(data) {
    const supabase = getSupabase()
    const item = { id: String(Date.now()), created_date: new Date().toISOString(), ...data }
    if (supabase) {
      const bucket = import.meta.env.VITE_SUPABASE_BUCKET || 'videos'
      const catalog = await loadCatalog(supabase, bucket)
      catalog.unshift(item)
      await saveCatalog(supabase, bucket, catalog)
      return item
    }
    try {
      const raw = localStorage.getItem('videos') || '[]'
      const list = JSON.parse(raw)
      list.unshift(item)
      localStorage.setItem('videos', JSON.stringify(list))
    } catch {}
    return item
  },
  async update(id, patch) {
    const supabase = getSupabase()
    if (supabase) {
      const bucket = import.meta.env.VITE_SUPABASE_BUCKET || 'videos'
      const catalog = await loadCatalog(supabase, bucket)
      const idx = catalog.findIndex(v => String(v.id) === String(id))
      if (idx >= 0) {
        catalog[idx] = { ...catalog[idx], ...patch }
        await saveCatalog(supabase, bucket, catalog)
        return catalog[idx]
      }
      return { id, ...patch }
    }
    try {
      const raw = localStorage.getItem('videos') || '[]'
      const list = JSON.parse(raw)
      const idx = list.findIndex(v => String(v.id) === String(id))
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...patch }
        localStorage.setItem('videos', JSON.stringify(list))
        return list[idx]
      }
    } catch {}
    return { id, ...patch }
  }
}

export const FavoriteVideo = {
  async filter() {
    return []
  }
}

export const Campaign = {
  async filter() {
    return []
  }
}

export const Plan = {
  async filter() {
    return []
  }
}

export const Payment = {
  async filter() {
    return []
  }
}

export const Subscription = {
  async filter() {
    return []
  }
}

export const Notification = {
  async filter() {
    return []
  },
  async update(id, data) {
    return { id, ...data }
  }
}

export const AdMetric = {
  async filter() {
    return []
  }
}

export const Advertiser = {
  async filter() {
    return []
  }
}

export const ArtistApplication = {
  async filter() {
    return []
  }
}
