"use client";

import { useEffect,  useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Card, CardContent } from "@/app/components/ui/card";
import { ThumbsUp, ThumbsDown, Share2, Play } from "lucide-react";
//import axios from "axios";
import YouTube from "react-youtube";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Appbar } from "../components/Appbar";
import { YT_REGEX } from "../lib/utils";

const REFRESH_INTERVAL = 10 * 1000;

// Types
interface Video {
  id: string;
  type: string;
  url: string;
  extractedId: string;
  title: string;
  smallImg: string;
  bigImg: string;
  active: boolean;
  userId: string;
  upvotes: number;
  addedById: string;
  downvotes: number;
  haveUpvoted: boolean;
}

export default function StreamView({
  creatorId,
  playVideo = false,
}: {
  creatorId: string;
  playVideo?: boolean;
}) {
  const [inputLink, setInputLink] = useState("");
  const [queue, setQueue] = useState<Video[]>([]);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(false);
  const [playNextLoader, setPlayNextLoader] = useState(false);

  async function refreshStreams() {
    const res = await fetch(`/api/streams/?creatorId=${creatorId}`, {
      credentials: "include",
    });
    const json = await res.json();
    if (json.streams && Array.isArray(json.streams)) {
      setQueue(
        json.streams.length > 0
        /* eslint-disable  @typescript-eslint/no-explicit-any */
          ? json.streams.sort((a: any, b: any) => b.upvotes - a.upvotes)
          : [],
      );
    } else {
      setQueue([]);
    }
    setCurrentVideo((video) => {
      if (video?.id === json.activeStream?.stream?.id) {
        return video;
      }
      return json.activeStream.stream||null;
    });
  }

  useEffect(() => {
    refreshStreams();
    const interval = setInterval(() => {
      refreshStreams();
    }, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [refreshStreams]);
/* eslint-disable  @typescript-eslint/no-explicit-any */
  const handleStateChange = (event: any) => {
    if (event.data === 0) {
      playNext(); // Trigger next video when the current one ends
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
   alert(creatorId);

    try {
        const res = await fetch("/api/streams/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                creatorId: creatorId,
                url: inputLink,
            }),
        });
        

        if (!res.ok) {
            const error = await res.json();
            console.error("Error:", error.message || "Failed to add stream");
            alert(error.message || "An error occurred while adding the stream");
            return;
        }
    
     
      const newStream = await res.json();

      setQueue([...queue, newStream]);

     
    

        
    } catch (error) {
        console.error("Network or server error:", error);
        alert("An error occurred while adding the streams");
    } finally {
        setLoading(false);
        setInputLink("");
    }
};


  const handleVote = (id: string, isUpvote: boolean) => {
    setQueue(
      queue
        .map((video) =>
          video.id === id
            ? {
                ...video,
                upvotes: isUpvote ? video.upvotes + 1 : video.upvotes-1,
                //downvotes: !isUpvote ? video.downvotes + 1 : video.downvotes,
                haveUpvoted: !video.haveUpvoted,
              }
            : video
        )
        .sort((a, b) => b.upvotes - a.upvotes )
    );
    fetch(`/api/streams/${isUpvote ? "upvote" : "downvote"}`, {
      method: "POST",
      body: JSON.stringify({
        streamId: id,
      }),
    });
  };

  const playNext = async () => {
    if (queue.length > 0) {
      try {
        setPlayNextLoader(true);
        const data = await fetch("/api/streams/next", {
          method: "GET",
        });
        const json = await data.json();
        setCurrentVideo(json.stream);
        setQueue(queue.filter((video) => video.id !== json.stream?.id));
      } catch (e) {
        console.error(e);
      }
      setPlayNextLoader(false);
    }
  };

  const handleShare = () => {
    const sharableLink = `${window.location.hostname}/creator/${creatorId}`;
    navigator.clipboard.writeText(sharableLink).then(
      () => {
        toast.success("Link copied to clipboard", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      },
      (err) => {
        console.error("Could not copy text: ", err);
        toast.error("Failed to copy link. Please try again.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-[rgb(10,10,10)] text-gray-200">
      <Appbar />
      <div className="flex justify-center">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5 w-screen max-w-screen-xl pt-8 ">
          <div className="col-span-3">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold mb-4 text-purple-200">
                Up Next
              </h2>
              {queue.length === 0 && (
                <Card className="bg-gray-900 border-gray-800 w-full">
                  <CardContent className="p-4">
                    <p className="text-center py-8 text-gray-400">
                      No videos in queue
                    </p>
                  </CardContent>
                </Card>
              )}
              {queue.map((video) => (
                <Card key={video.id} className="bg-gray-900 border-gray-800">
                  <CardContent className="p-4 flex items-center space-x-4">
                    <img
                      src={video.smallImg}
                      alt={`Thumbnail for ${video.title}`}
                      className="w-30 h-20 object-cover rounded"
                    />
                    <div className="flex-grow">
                      <h3 className="font-semibold text-white">
                        {video.title}
                      </h3>
                      <div className="flex items-center space-x-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleVote(video.id, video.haveUpvoted ? false : true)
                          }
                          className="flex items-center space-x-1 bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
                        >
                          {video.haveUpvoted ? (
                            <ThumbsDown className="h-4 w-4" />
                          ) : (
                            <ThumbsUp className="h-4 w-4" />
                          )}
                          <span>{video.upvotes}</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div className="col-span-2">
            <div className="max-w-4xl mx-auto p-4 space-y-6 w-full">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">
                  Song Voting Queue
                </h1>
                <Button
                  onClick={handleShare}
                  className="bg-purple-700 hover:bg-purple-800 text-white"
                >
                  <Share2 className="mr-2 h-4 w-4" /> Share
                </Button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-2">
                <Input
                  type="text"
                  placeholder="Paste YouTube link here"
                  value={inputLink}
                  onChange={(e) => setInputLink(e.target.value)}
                  className="bg-gray-900 text-white border-gray-700 placeholder-gray-500"
                />
                <Button
                  disabled={loading}
                  onClick={handleSubmit}
                  type="submit"
                  className="w-full bg-purple-700 hover:bg-purple-800 text-white"
                >
                  {loading ? "Adding..." : "Add to Queue"}
                </Button>
              </form>
              {inputLink && inputLink.match(YT_REGEX) && !loading && (
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-4">
                    <YouTube
                      videoId={inputLink.split("?v=")[1]}
                      opts={{ height: "100%", width: "100%" }}
                    />
                  </CardContent>
                </Card>
              )}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">Now Playing</h2>
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-4">
                    {currentVideo ? (
                      <YouTube
                        videoId={currentVideo.extractedId}
                        opts={{
                          height: "100%",
                          width: "100%",
                          playerVars: { autoplay: 1 },
                        }}
                        onStateChange={handleStateChange}
                      />
                    ) : (
                      <p className="text-center py-8 text-gray-400">
                        No video playing
                      </p>
                    )}
                  </CardContent>
                </Card>
                {playVideo && (
                  <Button
                    disabled={playNextLoader}
                    onClick={playNext}
                    className="w-full bg-purple-700 hover:bg-purple-800 text-white"
                  >
                    <Play className="mr-2 h-4 w-4" />{" "}
                    {playNextLoader ? "Loading..." : "Play Next"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}
