import { auth, signOutUser, onAuthChanged } from '@/firebase'

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
  }
}

export const Video = {
  async filter() {
    try {
      const raw = localStorage.getItem('videos') || '[]'
      return JSON.parse(raw)
    } catch {
      return []
    }
  },
  async get(id) {
    try {
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
