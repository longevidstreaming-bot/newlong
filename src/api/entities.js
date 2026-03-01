export const User = {
  async me() {
    return null
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
