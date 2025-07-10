"use client";

import { useState } from "react";

interface TikTokEmbedProps {
  url: string;
  className?: string;
}

export function TikTokEmbed({ url, className }: TikTokEmbedProps) {
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
    </div>
  );
}
