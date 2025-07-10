"use client";

import { useState } from "react";

import { Heart, MessageCircle, Eye, Share } from "@/components/ui/icons";
import { formatNumber } from "@/lib/utils/format";

interface TikTokEmbedProps {
  url: string;
  className?: string;
  caption?: string;
  metrics?: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
  };
  showMetrics?: boolean;
}

export function TikTokEmbed({
  url,
  className,
  caption,
  metrics,
  showMetrics = false,
}: TikTokEmbedProps) {
  const [error, setError] = useState<string | null>(null);

  const isValidTikTokUrl = (url: string): boolean => {
    const pattern = /^https:\/\/(www\.)?tiktok\.com\/@[\w.-]+\/video\/\d+/;
    return pattern.test(url);
  };

  const generateTikTokEmbed = (url: string): string => {
    const match = url.match(/\/video\/(\d+)/);
    if (!match) {
      setError("Could not extract video ID from URL");
      return "";
    }

    const videoId = match[1];
    return `<iframe 
      src="https://www.tiktok.com/embed/v2/${videoId}" 
      width="325" 
      height="560"
      frameborder="0"
      allow="encrypted-media;"
      sandbox="allow-scripts allow-same-origin allow-popups allow-presentation">
    </iframe>`;
  };

  if (!isValidTikTokUrl(url)) {
    return (
      <div
        className={`p-4 border border-red-200 rounded-lg bg-red-50 ${className || ""}`}
      >
        <p className="text-red-700 text-sm">
          Invalid TikTok URL. Please provide a valid TikTok video URL.
        </p>
      </div>
    );
  }

  const embedHtml = generateTikTokEmbed(url);

  if (error) {
    return (
      <div
        className={`p-4 border border-red-200 rounded-lg bg-red-50 ${className || ""}`}
      >
        <p className="text-red-700 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className={`tiktok-embed ${className || ""}`}>
      <div dangerouslySetInnerHTML={{ __html: embedHtml }} />

      {/* Optional caption and metrics */}
      {showMetrics && (caption || metrics) && (
        <div className="p-4 space-y-3 bg-white">
          {/* Caption */}
          {caption && (
            <p className="text-sm line-clamp-2 text-gray-700">{caption}</p>
          )}

          {/* Metrics */}
          {metrics && (
            <div className="flex items-center gap-4">
              {metrics.likes !== undefined && (
                <div className="flex items-center gap-1.5">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span className="font-medium text-sm">
                    {formatNumber(metrics.likes)}
                  </span>
                </div>
              )}
              {metrics.comments !== undefined && (
                <div className="flex items-center gap-1.5">
                  <MessageCircle className="h-4 w-4 text-blue-500" />
                  <span className="font-medium text-sm">
                    {formatNumber(metrics.comments)}
                  </span>
                </div>
              )}
              {metrics.views !== undefined && metrics.views > 0 && (
                <div className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4 text-green-500" />
                  <span className="font-medium text-sm">
                    {formatNumber(metrics.views)}
                  </span>
                </div>
              )}
              {metrics.shares !== undefined && metrics.shares > 0 && (
                <div className="flex items-center gap-1.5">
                  <Share className="h-4 w-4 text-purple-500" />
                  <span className="font-medium text-sm">
                    {formatNumber(metrics.shares)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
