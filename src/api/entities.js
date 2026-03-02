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
    return []
  },
  async create(data) {
    return { id: String(Date.now()), ...data }
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
