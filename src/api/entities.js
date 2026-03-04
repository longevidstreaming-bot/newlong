import { auth, signOutUser, onAuthChanged } from '@/firebase'
import { collection, getDocs } from 'firebase/firestore'
import { getSupabase } from '@/supabase'

async function loadCatalog() {
  return []
}

async function saveCatalog() {
  return
}

async function listAll(supabase, bucket) {
  const collected = []
  const visited = new Set()
  const queue = ['', 'uploads']
  while (queue.length) {
    const prefix = queue.shift()
    const keyPrefix = prefix || ''
    if (visited.has(keyPrefix)) continue
    visited.add(keyPrefix)
    const { data } = await supabase.storage.from(bucket).list(prefix, { limit: 1000 })
    const items = Array.isArray(data) ? data : []
    for (const item of items) {
      const name = item.name || ''
      const lower = name.toLowerCase()
      const isVideo = lower.endsWith('.mp4') || lower.endsWith('.webm')
      if (isVideo) {
        const path = prefix ? `${prefix}/${name}` : name
        collected.push({ ...item, name: path, path })
      } else {
        const next = prefix ? `${prefix}/${name}` : name
        queue.push(next)
      }
    }
  }
  return collected
}

// Firebase Storage não é usado para listagem

async function listFromFirestore() {
  try {
    const snap = await getDocs(collection(db, 'videos'))
    const videos = snap.docs.map(doc => {
      const d = doc.data() || {}
      return {
        id: String(doc.id),
        title: d.title || 'Vídeo',
        description: d.description || '',
        video_url: d.video_url || d.file_url || d.url || '',
        thumbnail_url: d.thumbnail_url || d.thumb_url || '',
        artist_id: d.artist_id || '',
        artist_name: d.artist_name || 'longEvid streaming',
        created_date: d.created_date || new Date().toISOString(),
        category: d.category || 'pop',
        views: d.views || 0,
        likes: d.likes || 0,
        is_deleted: !!d.is_deleted
      }
    })
    return videos
  } catch {
    return []
  }
}

async function listFromServerless() {
  try {
    const res = await fetch('/api/videos', { cache: 'no-store' })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
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
      const id = v.artist_id
      if (!id) return
      if (!map.has(id)) {
        map.set(id, {
          id,
          artist_name: v.artist_name || 'Artista',
          artist_avatar: v.artist_avatar || v.thumbnail_url || '',
          artist_bio: '',
          created_date: v.created_date,
          genre: v.category || 'pop'
        })
      }
    })
    let list = Array.from(map.values())
    if (criteria?.role === 'artist') {
      list = list
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
        artist_avatar: fromVideo.artist_avatar || fromVideo.thumbnail_url || '',
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
      const files = await listAll(supabase, bucket)
      const videos = files
        .filter(f => f.name.toLowerCase().endsWith('.mp4') || f.name.toLowerCase().endsWith('.webm'))
        .map(f => {
          const fileName = f.name.includes('/') ? f.name.split('/').pop() : f.name
          const baseId = fileName.replace(/\.(mp4|webm)$/i, '')
          const mp4Path = f.path || f.name
          const thumb = files.find(t => {
            const tfile = t.name.includes('/') ? t.name.split('/').pop() : t.name
            return tfile.startsWith(baseId) && tfile.includes('thumbnail')
          })
          const thumbPath = thumb ? (thumb.path || thumb.name) : null
          const mp4Url = supabase.storage.from(bucket).getPublicUrl(mp4Path).data.publicUrl
          const thumbUrl = thumbPath ? supabase.storage.from(bucket).getPublicUrl(thumbPath).data.publicUrl : null
          const title = fileName.replace(/^\d+_/, '').replace(/\.(mp4|webm)$/i, '')
          return {
            id: baseId,
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
      // Override with local metadata if present
      try {
        const raw = localStorage.getItem('videos') || '[]'
        const localList = JSON.parse(raw)
        const localMap = new Map(localList.map(v => [String(v.id), v]))
        for (let i = 0; i < videos.length; i++) {
          const id = String(videos[i].id)
          if (localMap.has(id)) {
            const meta = localMap.get(id)
            videos[i] = { ...videos[i], ...meta }
          }
        }
        // Include purely local entries not present in storage listing
        const listedIds = new Set(videos.map(v => String(v.id)))
        for (const v of localList) {
          if (!listedIds.has(String(v.id))) {
            videos.unshift(v)
          }
        }
      } catch {}
      if (videos.length > 0) {
        try {
          await saveCatalog(supabase, bucket, videos)
        } catch {}
      }
      if (videos.length > 0) return videos
      {
        const slVideos = await listFromServerless()
        if (slVideos.length > 0) {
          try {
            const raw = localStorage.getItem('videos') || '[]'
            const localList = JSON.parse(raw)
            const localMap = new Map(localList.map(v => [String(v.id), v]))
            const basename = (urlOrName) => {
              const s = String(urlOrName || '')
              const last = s.split('?')[0].split('#')[0].split('/').pop() || s
              return last.replace(/\.[^/.]+$/, '')
            }
            for (let i = 0; i < slVideos.length; i++) {
              const remote = slVideos[i]
              const rid = String(remote.id)
              let meta = localMap.get(rid)
              if (!meta) {
                const rbase = basename(remote.video_url || remote.file_url || remote.name || rid)
                meta = localList.find(v => {
                  const vbase = basename(v.video_url || v.file_url || v.name || v.id)
                  return vbase === rbase || String(v.id) === rbase || String(v.id) === rid
                })
              }
              if (meta) {
                slVideos[i] = { ...remote, ...meta }
              } else {
                const rbase = basename(remote.video_url || remote.file_url || remote.name || rid)
                const looksLikeFile = /\.(mp4|webm|mov|avi)$/i.test(String(remote.title || '')) || String(remote.title || '').toLowerCase().includes('.mp4')
                if (!remote.title || looksLikeFile) {
                  const pretty = rbase.replace(/^\d+_/, '').replace(/[_-]+/g, ' ').trim()
                  slVideos[i] = { ...remote, title: pretty || 'Vídeo' }
                }
              }
            }
            const listedBases = new Set(slVideos.map(v => basename(v.video_url || v.file_url || v.name || v.id)))
            for (const v of localList) {
              const vbase = basename(v.video_url || v.file_url || v.name || v.id)
              const idMatch = slVideos.find(r => String(r.id) === String(v.id))
              const baseMatch = listedBases.has(vbase)
              if (!idMatch && !baseMatch) {
                slVideos.unshift(v)
              }
            }
          } catch {}
          return slVideos
        }
      }
      const fsVideos = await listFromFirestore()
      if (fsVideos.length > 0) return fsVideos
      return []
    }
    try {
      {
        const slVideos = await listFromServerless()
        if (slVideos.length > 0) {
          try {
            const raw = localStorage.getItem('videos') || '[]'
            const localList = JSON.parse(raw)
            const localMap = new Map(localList.map(v => [String(v.id), v]))
            const basename = (urlOrName) => {
              const s = String(urlOrName || '')
              const last = s.split('?')[0].split('#')[0].split('/').pop() || s
              return last.replace(/\.[^/.]+$/, '')
            }
            for (let i = 0; i < slVideos.length; i++) {
              const remote = slVideos[i]
              const rid = String(remote.id)
              let meta = localMap.get(rid)
              if (!meta) {
                const rbase = basename(remote.video_url || remote.file_url || remote.name || rid)
                meta = localList.find(v => {
                  const vbase = basename(v.video_url || v.file_url || v.name || v.id)
                  return vbase === rbase || String(v.id) === rbase || String(v.id) === rid
                })
              }
              if (meta) {
                slVideos[i] = { ...remote, ...meta }
              } else {
                const rbase = basename(remote.video_url || remote.file_url || remote.name || rid)
                const looksLikeFile = /\.(mp4|webm|mov|avi)$/i.test(String(remote.title || '')) || String(remote.title || '').toLowerCase().includes('.mp4')
                if (!remote.title || looksLikeFile) {
                  const pretty = rbase.replace(/^\d+_/, '').replace(/[_-]+/g, ' ').trim()
                  slVideos[i] = { ...remote, title: pretty || 'Vídeo' }
                }
              }
            }
            const listedBases = new Set(slVideos.map(v => basename(v.video_url || v.file_url || v.name || v.id)))
            for (const v of localList) {
              const vbase = basename(v.video_url || v.file_url || v.name || v.id)
              const idMatch = slVideos.find(r => String(r.id) === String(v.id))
              const baseMatch = listedBases.has(vbase)
              if (!idMatch && !baseMatch) {
                slVideos.unshift(v)
              }
            }
          } catch {}
          return slVideos
        }
      }
      const raw = localStorage.getItem('videos') || '[]'
      const fsVideos = await listFromFirestore()
      if (fsVideos.length > 0) return fsVideos
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
      const files = await listAll(supabase, bucket)
      const base = files.find(f => {
        const fname = f.name.includes('/') ? f.name.split('/').pop() : f.name
        return fname.startsWith(`${id}`) && (fname.endsWith('.mp4') || fname.endsWith('.webm'))
      })
      if (!base) return null
      const mp4Path = base.path || base.name
      const thumb = files.find(t => {
        const tfile = t.name.includes('/') ? t.name.split('/').pop() : t.name
        return tfile.startsWith(`${id}`) && tfile.includes('thumbnail')
      })
      const thumbPath = thumb ? (thumb.path || thumb.name) : null
      const mp4Url = supabase.storage.from(bucket).getPublicUrl(mp4Path).data.publicUrl
      const thumbUrl = thumbPath ? supabase.storage.from(bucket).getPublicUrl(thumbPath).data.publicUrl : null
      const baseFile = base.name.includes('/') ? base.name.split('/').pop() : base.name
      const title = baseFile.replace(/^\d+_/, '').replace(/\.(mp4|webm)$/i, '')
      const candidate = {
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
      try {
        const raw = localStorage.getItem('videos') || '[]'
        const list = JSON.parse(raw)
        const foundLocal = list.find(v => String(v.id) === String(id))
        if (foundLocal) return { ...candidate, ...foundLocal }
      } catch {}
      return candidate
    }
    try {
      {
        const slVideos = await listFromServerless()
        if (slVideos.length > 0) {
          const found = slVideos.find(v => String(v.id) === String(id))
          if (found) return found
        }
      }
      const fsVideos = await listFromFirestore()
      if (fsVideos.length > 0) {
        const found = fsVideos.find(v => String(v.id) === String(id))
        if (found) return found
      }
      const raw = localStorage.getItem('videos') || '[]'
      const list = JSON.parse(raw)
      return list.find(v => String(v.id) === String(id)) || null
    } catch {
      return null
    }
  },
  async create(data) {
    const item = { id: String(data?.id || Date.now()), created_date: new Date().toISOString(), ...data }
    try {
      const raw = localStorage.getItem('videos') || '[]'
      const list = JSON.parse(raw)
      list.unshift(item)
      localStorage.setItem('videos', JSON.stringify(list))
    } catch {}
    return item
  },
  async update(id, patch) {
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
