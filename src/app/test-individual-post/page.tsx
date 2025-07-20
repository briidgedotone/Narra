"use client";

import { useState } from "react";

interface PostData {
  success: boolean;
  data?: {
    transformed: any;
    raw: any;
  };
  error?: string;
  cached?: boolean;
  shortcode?: string;
}

export default function TestIndividualPostPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PostData | null>(null);

  const exampleUrls = [
    "https://www.instagram.com/p/DF5s0duxDts/",
    "https://www.instagram.com/reel/DF5s0duxDts/",
    "https://instagram.com/p/DF5s0duxDts/",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`/api/individual-post?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: "Network error occurred"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadExample = (exampleUrl: string) => {
    setUrl(exampleUrl);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Individual Post Scraping Test
          </h1>

          <form onSubmit={handleSubmit} className="mb-8">
            <div className="mb-4">
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                Instagram Post URL
              </label>
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.instagram.com/p/shortcode/"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Or try one of these examples:</p>
              <div className="flex flex-wrap gap-2">
                {exampleUrls.map((exampleUrl, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => loadExample(exampleUrl)}
                    className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    Example {index + 1}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Fetching..." : "Fetch Post Data"}
            </button>
          </form>

          {result && (
            <div className="space-y-6">
              {/* Status */}
              <div className="p-4 rounded-md border">
                <h3 className="font-medium mb-2">Request Status</h3>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block w-3 h-3 rounded-full ${
                      result.success ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  <span className={result.success ? "text-green-700" : "text-red-700"}>
                    {result.success ? "Success" : "Failed"}
                  </span>
                  {result.cached && (
                    <span className="text-blue-600 text-sm">(Cached)</span>
                  )}
                </div>
                {result.shortcode && (
                  <p className="text-sm text-gray-600 mt-1">
                    Shortcode: <code className="bg-gray-100 px-1 rounded">{result.shortcode}</code>
                  </p>
                )}
                {result.error && (
                  <p className="text-red-600 text-sm mt-2">{result.error}</p>
                )}
              </div>

              {/* Transformed Data */}
              {result.success && result.data?.transformed && (
                <div className="p-4 rounded-md border">
                  <h3 className="font-medium mb-3">Transformed Post Data</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Basic Info</h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">ID:</span> {result.data.transformed.id}</p>
                        <p><span className="font-medium">Shortcode:</span> {result.data.transformed.shortcode}</p>
                        <p><span className="font-medium">Type:</span> {result.data.transformed.isVideo ? "Video" : "Image"}</p>
                        <p><span className="font-medium">Product Type:</span> {result.data.transformed.productType}</p>
                        {result.data.transformed.videoDuration && (
                          <p><span className="font-medium">Duration:</span> {result.data.transformed.videoDuration}s</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Metrics</h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Likes:</span> {result.data.transformed.metrics.likes?.toLocaleString()}</p>
                        <p><span className="font-medium">Comments:</span> {result.data.transformed.metrics.comments?.toLocaleString()}</p>
                        {result.data.transformed.metrics.views && (
                          <p><span className="font-medium">Views:</span> {result.data.transformed.metrics.views?.toLocaleString()}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Owner</h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Username:</span> @{result.data.transformed.owner.username}</p>
                        <p><span className="font-medium">Full Name:</span> {result.data.transformed.owner.fullName}</p>
                        <p><span className="font-medium">Verified:</span> {result.data.transformed.owner.isVerified ? "Yes" : "No"}</p>
                        {result.data.transformed.owner.followers && (
                          <p><span className="font-medium">Followers:</span> {result.data.transformed.owner.followers?.toLocaleString()}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Media</h4>
                      <div className="space-y-1 text-sm">
                        {result.data.transformed.dimensions && (
                          <p><span className="font-medium">Dimensions:</span> {result.data.transformed.dimensions.width}x{result.data.transformed.dimensions.height}</p>
                        )}
                        <p><span className="font-medium">Posted:</span> {new Date(result.data.transformed.takenAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  {result.data.transformed.caption && (
                    <div className="mt-4">
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Caption</h4>
                      <p className="text-sm bg-gray-50 p-3 rounded border max-h-32 overflow-y-auto">
                        {result.data.transformed.caption}
                      </p>
                    </div>
                  )}

                  {result.data.transformed.displayUrl && (
                    <div className="mt-4">
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Preview</h4>
                      <img 
                        src={result.data.transformed.displayUrl} 
                        alt="Post preview"
                        className="max-w-xs rounded border"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Raw API Response */}
              {result.success && result.data?.raw && (
                <div className="p-4 rounded-md border">
                  <h3 className="font-medium mb-3">Raw API Response</h3>
                  <pre className="text-xs bg-gray-50 p-3 rounded border max-h-96 overflow-auto">
                    {JSON.stringify(result.data.raw, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}