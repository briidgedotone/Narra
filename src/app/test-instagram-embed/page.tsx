"use client";

import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function TestInstagramEmbedPage() {
  const [url, setUrl] = useState("");
  const [embedHtml, setEmbedHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load Instagram embed script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.instagram.com/embed.js";
    script.async = true;
    script.onload = () => {
      // Process any existing embeds
      if (window.instgrm && window.instgrm.Embeds) {
        window.instgrm.Embeds.process();
      }
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector(
        'script[src="https://www.instagram.com/embed.js"]'
      );
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  // Process Instagram embeds when embedHtml changes
  useEffect(() => {
    if (embedHtml && window.instgrm && window.instgrm.Embeds) {
      setTimeout(() => {
        window.instgrm.Embeds.process();
      }, 100);
    }
  }, [embedHtml]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError("");
    setEmbedHtml("");

    try {
      const response = await fetch("/api/instagram-embed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (data.success && data.data?.html) {
        setEmbedHtml(data.data.html);
      } else {
        setError(data.error || "Failed to generate embed");
      }
    } catch {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Instagram Embed Tester</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="url" className="block text-sm font-medium mb-2">
                  Instagram URL
                </label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://www.instagram.com/p/C2EvZnehID3/"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? "Generating..." : "Generate Embed"}
              </Button>
            </form>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {embedHtml && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Generated Embed HTML</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
                  <code>{embedHtml}</code>
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white p-4 rounded-md border">
                  <div
                    className="instagram-embed"
                    dangerouslySetInnerHTML={{ __html: embedHtml }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
