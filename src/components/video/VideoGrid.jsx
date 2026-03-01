import React from "react";
import VideoCard from "./VideoCard";
import { motion } from "framer-motion";

export default function VideoGrid({ videos, isLoading, currentUser }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array(12).fill(0).map((_, i) => (
          <div key={i} className="space-y-3 animate-pulse">
            <div className="aspect-video bg-gray-800 rounded-2xl"></div>
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-gray-800 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-800 rounded"></div>
                <div className="h-3 bg-gray-800 rounded w-2/3"></div>
                <div className="h-3 bg-gray-800 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      {videos.map((video, index) => (
        <VideoCard key={video.id} video={video} index={index} currentUser={currentUser} />
      ))}
    </motion.div>
  );
}