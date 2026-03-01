import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function MyVideosList() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const fetchVideos = async () => {
      const querySnapshot = await getDocs(collection(db, "videos"));
      setVideos(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchVideos();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">My Videos</h2>
      <ul className="space-y-2">
        {videos.map(video => (
          <li key={video.id} className="border p-2 rounded">
            <p className="font-semibold">{video.title}</p>
            <p>{video.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
