"use client";

import { useEffect, useState } from "react";
import StreamView from "../components/StreamView"; 

export default function Component() {
  const [creatorId, setCreatorId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCreatorId = async () => {
      try {
        const res = await fetch("/api/user", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (res.ok) {
          const { user } = await res.json();
          setCreatorId(user?.id || null);
        } else {
          console.error("Failed to fetch session.");
        }
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCreatorId();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!creatorId) {
    return <p>Unable to retrieve creator information.</p>;
  }

  return <StreamView creatorId={creatorId} playVideo={true} />;
}
