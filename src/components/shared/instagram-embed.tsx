"use client";

import { useEffect, memo, useMemo, useRef, useCallback } from "react";

import {
  Heart,
  MessageCircle,
  Eye,
  Share,
  Bookmark,
  X,
} from "@/components/ui/icons";
import { formatNumber } from "@/lib/utils/format";

interface InstagramEmbedProps {
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
  onDetailsClick?: () => void;
  onSaveClick?: () => void;
  onRemoveClick?: () => void;
}

function InstagramEmbedComponent({
  url,
  className,
  caption,
  metrics,
  showMetrics = false,
  onDetailsClick,
  onSaveClick,
  onRemoveClick,
}: InstagramEmbedProps) {

  // Memoized URL validation
  const isValidUrl = useMemo(() => {
    const patterns = [
      /^https:\/\/(www\.)?instagram\.com\/p\/[\w-]+/,
      /^https:\/\/(www\.)?instagram\.com\/reel\/[\w-]+/,
      /^https:\/\/(www\.)?instagram\.com\/tv\/[\w-]+/,
    ];
    return patterns.some(pattern => pattern.test(url));
  }, [url]);


  // Simple iframe-based Instagram embed - more reliable than script processing
  const embedUrl = useMemo(() => {
    if (!isValidUrl) return "";
    
    // Extract shortcode from URL
    const match = url.match(/\/(p|reel|tv)\/([\w-]+)/);
    if (!match) return "";
    
    const shortcode = match[2];
    return `https://www.instagram.com/p/${shortcode}/embed/`;
  }, [url, isValidUrl]);

  // Memoized click handlers to prevent function recreation
  const handleSaveClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSaveClick?.();
  }, [onSaveClick]);

  const handleRemoveClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onRemoveClick?.();
  }, [onRemoveClick]);

  const handleDetailsClick = useCallback(() => {
    onDetailsClick?.();
  }, [onDetailsClick]);

  if (!isValidUrl) {
    return (
      <div
        className={`p-4 border border-red-200 rounded-lg bg-red-50 ${className || ""}`}
      >
        <p className="text-red-700 text-sm">
          Invalid Instagram URL. Please provide a valid Instagram post, reel, or
          TV URL.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`instagram-embed max-w-full mx-auto relative group ${className || ""}`}
    >
      <div className="flex justify-center">
        <iframe
          src={embedUrl}
          width="320"
          height="500"
          frameBorder="0"
          scrolling="no"
          allowTransparency={true}
          className="rounded-lg"
          title="Instagram embed"
        />
      </div>

      {/* Action Buttons - Shows on hover */}
      {(onSaveClick || onRemoveClick) && (
        <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ top: '60px' }}>
          <div className="flex gap-1">
            {onRemoveClick && (
              <button
                onClick={handleRemoveClick}
                className="w-8 h-8 bg-red-500/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-500 shadow-sm transition-colors cursor-pointer"
                title="Remove from board"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            )}
            {onSaveClick && (
              <button
                onClick={handleSaveClick}
                className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white shadow-sm transition-colors cursor-pointer"
                title="Save to board"
              >
                <Bookmark className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Optional caption and metrics */}
      {showMetrics && (caption || metrics) && (
        <div
          className="p-4 space-y-3 bg-white cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={handleDetailsClick}
        >
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
              {metrics.views !== undefined && (
                <div className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4 text-green-500" />
                  <span className="font-medium text-sm">
                    {formatNumber(metrics.views || 0)}
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

export const InstagramEmbed = memo(InstagramEmbedComponent, (prevProps, nextProps) => {
  // Only re-render if essential props have changed
  return (
    prevProps.url === nextProps.url &&
    prevProps.className === nextProps.className &&
    prevProps.caption === nextProps.caption &&
    prevProps.showMetrics === nextProps.showMetrics &&
    JSON.stringify(prevProps.metrics) === JSON.stringify(nextProps.metrics) &&
    // Don't compare function props as they may be recreated
    // The component handles function prop changes with useCallback internally
    true
  );
});
