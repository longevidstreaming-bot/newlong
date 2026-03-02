import { auth, signOutUser, onAuthChanged, storage, db } from '@/firebase'
import { ref as fbRef, listAll as fbListAll, getDownloadURL as fbGetDownloadURL } from 'firebase/storage'
import { collection, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore'
import { getSupabase } from '@/supabase'

async function loadCatalog() {
  return []
}

async function saveCatalog() {
  return
}

async function listAll(supabase, bucket) {
  const { data } = await supabase.storage.from(bucket).list('uploads', { limit: 1000 })
  let files = Array.isArray(data) ? data : []
  if (files.length === 0) {
    const { data: root } = await supabase.storage.from(bucket).list('', { limit: 1000 })
    const rootItems = Array.isArray(root) ? root : []
    const leafFiles = rootItems.filter(f => f.name?.toLowerCase().endsWith('.mp4') || f.name?.toLowerCase().endsWith('.webm'))
    const folders = rootItems.filter(f => f.id && !f.name?.toLowerCase().endsWith('.mp4') && !f.name?.toLowerCase().endsWith('.webm'))
    files = [...leafFiles]
    for (const folder of folders) {
      const { data: sub } = await supabase.storage.from(bucket).list(folder.name, { limit: 1000 })
      const subFiles = Array.isArray(sub) ? sub : []
      files = files.concat(subFiles.map(sf => ({ ...sf, name: `${folder.name}/${sf.name}` })))
    }
  }
  return files
}

async function listFromFirebase() {
  try {
    const base = fbRef(storage, 'uploads')
    const res = await fbListAll(base)
    const items = res.items || []
    const videos = []
    for (const item of items) {
      const name = item.name || ''
      const lower = name.toLowerCase()
      if (lower.endsWith('.mp4') || lower.endsWith('.webm')) {
        const prefix = name.split('_')[0]
        const mp4Url = await fbGetDownloadURL(item)
        const thumbItem = items.find(it => it.name.startsWith(prefix) && it.name.includes('thumbnail'))
        const thumbUrl = thumbItem ? await fbGetDownloadURL(thumbItem) : null
        const title = name.replace(/^\d+_/, '').replace(/\.(mp4|webm)$/i, '')
        videos.push({
          id: prefix,
          title,
          description: '',
          video_url: mp4Url,
          thumbnail_url: thumbUrl,
          artist_id: auth.currentUser?.uid || '',
          artist_name: auth.currentUser?.displayName || 'longEvid streaming',
          created_date: new Date().toISOString(),
          category: 'pop',
          views: 0,
          likes: 0,
          is_deleted: false
        })
      }
    }
    return videos
  } catch {
    return []
  }
}

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
      const files = await listAll(supabase, bucket)
      const videos = files
        .filter(f => f.name.toLowerCase().endsWith('.mp4') || f.name.toLowerCase().endsWith('.webm'))
        .map(f => {
          const prefix = f.name.split('_')[0]
          const mp4Path = `uploads/${f.name}`
          const thumb = files.find(t => t.name.startsWith(prefix) && t.name.includes('thumbnail'))
          const thumbPath = thumb ? (thumb.name.includes('/') ? `${thumb.name}` : `uploads/${thumb.name}`) : null
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
      if (videos.length > 0) {
        try {
          await saveCatalog(supabase, bucket, videos)
        } catch {}
      }
      if (videos.length > 0) return videos
      const fbVideos = await listFromFirebase()
      if (fbVideos.length > 0) return fbVideos
      const fsVideos = await listFromFirestore()
      if (fsVideos.length > 0) return fsVideos
      return []
    }
    try {
      const raw = localStorage.getItem('videos') || '[]'
      const fbVideos = await listFromFirebase()
      if (fbVideos.length > 0) return fbVideos
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
      const base = files.find(f => f.name.startsWith(`${id}_`) && (f.name.endsWith('.mp4') || f.name.endsWith('.webm')))
      if (!base) return null
      const mp4Path = base.name.includes('/') ? base.name : `uploads/${base.name}`
      const thumb = files.find(t => t.name.startsWith(`${id}_`) && t.name.includes('thumbnail'))
      const thumbPath = thumb ? (thumb.name.includes('/') ? thumb.name : `uploads/${thumb.name}`) : null
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
      const fbVideos = await listFromFirebase()
      if (fbVideos.length > 0) {
        const found = fbVideos.find(v => String(v.id) === String(id))
        if (found) return found
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
    const item = { id: String(Date.now()), created_date: new Date().toISOString(), ...data }
    try {
      const ref = doc(db, 'videos', item.id)
      await setDoc(ref, item, { merge: true })
      return item
    } catch {
      try {
        const raw = localStorage.getItem('videos') || '[]'
        const list = JSON.parse(raw)
        list.unshift(item)
        localStorage.setItem('videos', JSON.stringify(list))
      } catch {}
      return item
    }
  },
  async update(id, patch) {
    try {
      const ref = doc(db, 'videos', String(id))
      await updateDoc(ref, patch)
      const fsVideos = await listFromFirestore()
      const found = fsVideos.find(v => String(v.id) === String(id))
      if (found) return found
    } catch {}
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
