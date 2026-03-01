// src/api/entities.js

export const User = {
  id: "",
  name: "",
  email: "",
};

export const Video = {
  id: "",
  title: "",
  url: "",
};

export const FavoriteVideo = {
  id: "",
  userId: "",
  videoId: "",
};

export const Campaign = {
  id: "",
  name: "",
  description: "",
};

export const Plan = {
  id: "",
  name: "",
  price: 0,
};

export const Payment = {
  id: "",
  userId: "",
  amount: 0,
  date: null,
};

export const Subscription = {
  id: "",
  userId: "",
  planId: "",
};

export const Notification = {
  id: "",
  message: "",
  read: false,
};

export const AdMetric = {
  id: "",
  campaignId: "",
  views: 0,
  clicks: 0,
};

export const Advertiser = {
  id: "",
  name: "",
  company: "",
};

export const ArtistApplication = {
  id: "",
  userId: "",
  status: "pending",
};
