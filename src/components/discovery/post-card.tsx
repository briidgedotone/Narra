import { Calendar, Eye, Heart, MessageCircle, Share } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, formatMetric } from "@/lib/utils/format";

interface PostCardProps {
  post: {
    id?: string;
    shortcode?: string;
    aweme_id?: string;
    display_url?: string;
    video?: { cover?: { url_list?: string[] } };
    taken_at_timestamp?: number;
    create_time?: number;
    edge_liked_by?: { count: number };
    statistics?: {
      play_count?: number;
      digg_count?: number;
      comment_count?: number;
      share_count?: number;
    };
    edge_media_to_comment?: { count: number };
    is_video?: boolean;
    video_view_count?: number;
    edge_media_to_caption?: {
      edges: Array<{ node: { text: string } }>;
    };
    desc?: string;
  };
  platform: "instagram" | "tiktok";
}

export function PostCard({ post, platform }: PostCardProps) {
  const isInstagram = platform === "instagram";

  // Extract platform-specific data
  const imageUrl = isInstagram
    ? post.display_url
    : post.video?.cover?.url_list?.[0];

  const timestamp = isInstagram ? post.taken_at_timestamp : post.create_time;

  const likes = isInstagram
    ? post.edge_liked_by?.count
    : post.statistics?.digg_count;

  const comments = isInstagram
    ? post.edge_media_to_comment?.count
    : post.statistics?.comment_count;

  const views = isInstagram
    ? post.video_view_count
    : post.statistics?.play_count;

  const shares = post.statistics?.share_count;

  const caption = isInstagram
    ? post.edge_media_to_caption?.edges[0]?.node.text
    : post.desc;

  return (
    <Card className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
      <CardContent className="p-0">
        {/* Image/Video Thumbnail */}
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Post content"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">No image</span>
            </div>
          )}

          {/* Video indicator */}
          {(isInstagram ? post.is_video : true) && (
            <Badge
              className="absolute top-2 right-2 bg-black/70 text-white border-0"
              variant="secondary"
            >
              📹
            </Badge>
          )}
        </div>

        {/* Post Info */}
        <div className="p-3">
          {/* Caption */}
          {caption && (
            <p className="text-sm text-foreground mb-3 line-clamp-2">
              {caption}
            </p>
          )}

          {/* Metrics */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              {likes !== undefined && (
                <div className="flex items-center gap-1">
                  <Heart size={12} />
                  <span>{formatMetric(likes)}</span>
                </div>
              )}
              {comments !== undefined && (
                <div className="flex items-center gap-1">
                  <MessageCircle size={12} />
                  <span>{formatMetric(comments)}</span>
                </div>
              )}
              {views !== undefined && (
                <div className="flex items-center gap-1">
                  <Eye size={12} />
                  <span>{formatMetric(views)}</span>
                </div>
              )}
              {shares !== undefined && (
                <div className="flex items-center gap-1">
                  <Share size={12} />
                  <span>{formatMetric(shares)}</span>
                </div>
              )}
            </div>

            {/* Date */}
            {timestamp && (
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                <span>{formatDate(timestamp)}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
