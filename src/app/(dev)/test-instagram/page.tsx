"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function TestInstagramPage() {
  const [handle, setHandle] = useState("adrianhorning");
  const [profileResult, setProfileResult] = useState<unknown>(null);
  const [postsResult, setPostsResult] = useState<unknown>(null);
  const [discoveryResult, setDiscoveryResult] = useState<unknown>(null);
  const [apiKeyStatus, setApiKeyStatus] = useState<unknown>(null);
  const [loading, setLoading] = useState<{
    profile: boolean;
    posts: boolean;
    discovery: boolean;
    apiKey: boolean;
  }>({
    profile: false,
    posts: false,
    discovery: false,
    apiKey: false,
  });

  const testInstagramProfile = async () => {
    setLoading(prev => ({ ...prev, profile: true }));
    try {
      const response = await fetch(
        `/api/test-instagram?handle=${encodeURIComponent(handle)}`
      );
      const result = await response.json();
      setProfileResult(result);
    } catch (error) {
      setProfileResult({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  };

  const testInstagramPosts = async () => {
    setLoading(prev => ({ ...prev, posts: true }));
    try {
      const response = await fetch(
        `/api/test-scrapecreators?test=instagram-posts&handle=${encodeURIComponent(handle)}&count=5`
      );
      const result = await response.json();
      setPostsResult(result);
    } catch (error) {
      setPostsResult({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(prev => ({ ...prev, posts: false }));
    }
  };

  const testDiscoveryFlow = async () => {
    setLoading(prev => ({ ...prev, discovery: true }));
    try {
      const response = await fetch(
        `/api/test-discovery?handle=${encodeURIComponent(handle)}&platform=instagram`
      );
      const result = await response.json();
      setDiscoveryResult(result);
    } catch (error) {
      setDiscoveryResult({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(prev => ({ ...prev, discovery: false }));
    }
  };

  const testApiKey = async () => {
    setLoading(prev => ({ ...prev, apiKey: true }));
    try {
      const response = await fetch("/api/test-api-key");
      const result = await response.json();
      setApiKeyStatus(result);
    } catch (error) {
      setApiKeyStatus({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(prev => ({ ...prev, apiKey: false }));
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Instagram API Testing</h1>
        <p className="text-muted-foreground">
          Test Instagram profile and posts fetching using ScrapeCreators API
        </p>

        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Test Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Instagram Handle
              </label>
              <Input
                value={handle}
                onChange={e => setHandle(e.target.value)}
                placeholder="adrianhorning"
                className="w-full"
              />
            </div>
                        <div className="grid grid-cols-1 gap-2">
              <Button 
                onClick={testApiKey} 
                disabled={loading.apiKey}
                variant="secondary"
              >
                {loading.apiKey ? "Checking..." : "Check API Key"}
              </Button>
              <Button 
                onClick={testInstagramProfile} 
                disabled={loading.profile}
                variant="outline"
              >
                {loading.profile ? "Testing Profile..." : "Test Profile API"}
              </Button>
              <Button
                onClick={testInstagramPosts}
                disabled={loading.posts}
                variant="outline"
              >
                {loading.posts ? "Testing Posts..." : "Test Posts API"}
              </Button>
              <Button
                onClick={testDiscoveryFlow}
                disabled={loading.discovery}
                variant="default"
              >
                {loading.discovery
                  ? "Testing Discovery..."
                  : "Test Discovery Flow"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* API Key Status */}
        <Card>
          <CardHeader>
            <CardTitle>API Key Status</CardTitle>
          </CardHeader>
          <CardContent>
            {apiKeyStatus ? (
              <pre className="text-xs overflow-auto max-h-96 bg-muted p-3 rounded">
                {JSON.stringify(apiKeyStatus, null, 2)}
              </pre>
            ) : (
              <p className="text-muted-foreground">
                Click &quot;Check API Key&quot; to verify setup
              </p>
            )}
          </CardContent>
        </Card>

        {/* Profile Test Results */}
        <Card>
          <CardHeader>
            <CardTitle>Profile API Test</CardTitle>
          </CardHeader>
          <CardContent>
            {profileResult ? (
              <pre className="text-xs overflow-auto max-h-96 bg-muted p-3 rounded">
                {JSON.stringify(profileResult, null, 2)}
              </pre>
            ) : (
              <p className="text-muted-foreground">
                Click &quot;Test Profile API&quot; to see results
              </p>
            )}
          </CardContent>
        </Card>

        {/* Posts Test Results */}
        <Card>
          <CardHeader>
            <CardTitle>Posts API Test</CardTitle>
          </CardHeader>
          <CardContent>
            {postsResult ? (
              <pre className="text-xs overflow-auto max-h-96 bg-muted p-3 rounded">
                {JSON.stringify(postsResult, null, 2)}
              </pre>
            ) : (
              <p className="text-muted-foreground">
                Click &quot;Test Posts API&quot; to see results
              </p>
            )}
          </CardContent>
        </Card>

        {/* Discovery Test Results */}
        <Card>
          <CardHeader>
            <CardTitle>Discovery Flow Test</CardTitle>
          </CardHeader>
          <CardContent>
            {discoveryResult ? (
              <pre className="text-xs overflow-auto max-h-96 bg-muted p-3 rounded">
                {JSON.stringify(discoveryResult, null, 2)}
              </pre>
            ) : (
              <p className="text-muted-foreground">
                Click &quot;Test Discovery Flow&quot; to see results
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">
              Required Environment Variables
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Add the following to your <code>.env.local</code> file:
            </p>
            <pre className="bg-muted p-3 rounded text-xs">
              {`SCRAPECREATORS_API_KEY=your_actual_api_key_here`}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Expected Flow</h3>
            <ol className="text-sm space-y-1 text-muted-foreground">
              <li>
                1. Profile API should return user data with followers, posts
                count, etc.
              </li>
              <li>2. Posts API should return recent Instagram posts</li>
              <li>
                3. Discovery Flow should transform data for the discovery page
              </li>
            </ol>
          </div>

          <div>
            <h3 className="font-semibold mb-2">
              Testing Instagram in Discovery
            </h3>
            <p className="text-sm text-muted-foreground">
              Once the API is working, you can test Instagram search in the{" "}
              <a href="/discovery" className="text-blue-600 hover:underline">
                Discovery page
              </a>{" "}
              by selecting Instagram and searching for handles like
              &quot;adrianhorning&quot; or &quot;cristiano&quot;.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
