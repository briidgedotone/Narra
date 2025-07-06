"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading";

interface TikTokEmbedData {
  html: string;
  thumbnail_url: string;
  author_name: string;
  title: string;
  width: number;
  height: number;
}

export default function TestTikTokEmbedPage() {
  const [tiktokUrl, setTiktokUrl] = useState(
    "https://www.tiktok.com/@zachking/video/6768504823336815877"
  );
  const [embedData, setEmbedData] = useState<TikTokEmbedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testOEmbedAPI = async () => {
    setLoading(true);
    setError(null);
    setEmbedData(null);

    try {
      // Test direct oEmbed API call
      const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(
        tiktokUrl
      )}`;

      console.log("Testing oEmbed URL:", oembedUrl);

      const response = await fetch(oembedUrl, {
        method: "GET",
        headers: {
          "User-Agent": "Use Narra Bot/1.0",
          Accept: "application/json",
        },
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", Object.fromEntries(response.headers));

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        const text = await response.text();
        throw new Error(`Expected JSON, got ${contentType}. Response: ${text}`);
      }

      const data = await response.json();
      console.log("oEmbed data:", data);

      setEmbedData(data);
    } catch (err) {
      console.error("oEmbed test error:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const testViaAPI = async () => {
    setLoading(true);
    setError(null);
    setEmbedData(null);

    try {
      const response = await fetch("/api/test-tiktok-embed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: tiktokUrl }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      if (data.success) {
        setEmbedData(data.data);
      } else {
        throw new Error(data.error || "API returned error");
      }
    } catch (err) {
      console.error("API test error:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const generateIframeEmbed = () => {
    try {
      // Extract video ID from TikTok URL
      const match = tiktokUrl.match(/\/video\/(\d+)/);
      if (!match) {
        setError("Could not extract video ID from URL");
        return;
      }

      const videoId = match[1];
      const iframeHtml = `<iframe 
        src="https://www.tiktok.com/embed/v2/${videoId}" 
        width="325" 
        height="560"
        frameborder="0"
        allow="encrypted-media;"
        sandbox="allow-scripts allow-same-origin allow-popups allow-presentation">
      </iframe>`;

      setEmbedData({
        html: iframeHtml,
        thumbnail_url: "",
        author_name: "Direct iframe",
        title: `TikTok Video ${videoId}`,
        width: 325,
        height: 560,
      });
      setError(null);
    } catch (err) {
      setError("Failed to generate iframe embed");
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">TikTok Embed Testing</h1>

      <div className="space-y-6">
        {/* URL Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">TikTok URL:</label>
          <Input
            value={tiktokUrl}
            onChange={e => setTiktokUrl(e.target.value)}
            placeholder="https://www.tiktok.com/@username/video/123456789"
            className="w-full"
          />
        </div>

        {/* Test Buttons */}
        <div className="flex gap-4 flex-wrap">
          <Button onClick={testOEmbedAPI} disabled={loading}>
            {loading ? <LoadingSpinner className="mr-2" /> : null}
            Test oEmbed API (Direct)
          </Button>
          <Button onClick={testViaAPI} disabled={loading} variant="outline">
            {loading ? <LoadingSpinner className="mr-2" /> : null}
            Test via Our API
          </Button>
          <Button onClick={generateIframeEmbed} variant="secondary">
            Generate Iframe Embed
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-800 mb-2">Error:</h3>
            <p className="text-red-700 font-mono text-sm">{error}</p>
          </div>
        )}

        {/* Results Display */}
        {embedData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Embed Data */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Embed Data:</h2>
              <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm">
                <div>
                  <strong>Author:</strong> {embedData.author_name}
                </div>
                <div>
                  <strong>Title:</strong> {embedData.title}
                </div>
                <div>
                  <strong>Dimensions:</strong> {embedData.width} x{" "}
                  {embedData.height}
                </div>
                {embedData.thumbnail_url && (
                  <div>
                    <strong>Thumbnail:</strong>{" "}
                    <a
                      href={embedData.thumbnail_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </a>
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-2">Raw HTML:</h3>
                <textarea
                  value={embedData.html}
                  readOnly
                  className="w-full h-32 p-2 border rounded font-mono text-xs"
                />
              </div>
            </div>

            {/* Live Embed */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Live Embed:</h2>
              <div className="border rounded-lg p-4 bg-white">
                <div
                  dangerouslySetInnerHTML={{ __html: embedData.html }}
                  className="flex justify-center"
                />
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Instructions:</h3>
          <ul className="text-blue-700 space-y-1 text-sm">
            <li>
              1. Enter a valid TikTok video URL (format:
              https://www.tiktok.com/@username/video/123456789)
            </li>
            <li>2. Try "oEmbed API (Direct)" first to test direct API access</li>
            <li>
              3. Try "Test via Our API" to test through our backend endpoint
            </li>
            <li>
              4. Try "Generate Iframe Embed" as a fallback method if oEmbed fails
            </li>
            <li>5. Check if the embed displays and plays correctly</li>
          </ul>
        </div>
      </div>
    </div>
  );
}