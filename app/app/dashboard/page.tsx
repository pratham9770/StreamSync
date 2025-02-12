"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ThumbsUp, ThumbsDown, Share2, Play } from "lucide-react";
import axios from "axios";
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Appbar } from "../components/Appbar";
import { YT_REGEX } from "../lib/utils";
import StreamView from "../components/StreamView";
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
  downvotes: number;
  haveUpvoted: boolean;
}
const creatorId="3c4b4b4b-4b4b-4b4b-4b4b-4b4b4b4b4b4b"

export default function Component() {
  return <StreamView creatorId={creatorId} />;
  
}
