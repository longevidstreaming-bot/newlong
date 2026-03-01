import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function Subscriptions() {
  const [subs, setSubs] = useState([]);

  useEffect(() => {
    const fetchSubs = async () => {
      const querySnapshot = await getDocs(collection(db, "subscriptions"));
      setSubs(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchSubs();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Subscriptions</h2>
      <ul className="space-y-2">
        {subs.map(sub => (
          <li key={sub.id} className="border p-2 rounded">
            <p className="font-semibold">{sub.plan}</p>
            <p>User: {sub.userId}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
