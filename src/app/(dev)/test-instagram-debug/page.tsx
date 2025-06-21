"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestInstagramDebugPage() {
  const [result, setResult] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);

  const testWithKnownHandle = async (handle: string) => {
    setLoading(true);
    setResult(null);

    try {
      console.log(`Testing Instagram handle: ${handle}`);

      const response = await fetch(
        `/api/test-discovery?handle=${encodeURIComponent(handle)}&platform=instagram`
      );

      console.log(`Response status: ${response.status}`);

      const data = await response.json();
      console.log("Response data:", data);

      setResult({
        status: response.status,
        success: response.ok,
        data: data,
      });
    } catch (error) {
      console.error("Test failed:", error);
      setResult({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Instagram API Debug</h1>
        <p className="text-muted-foreground">
          Test Instagram profile discovery with known good handles
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          onClick={() => testWithKnownHandle("cristiano")}
          disabled={loading}
          variant="outline"
        >
          Test @cristiano (300M+ followers)
        </Button>

        <Button
          onClick={() => testWithKnownHandle("therock")}
          disabled={loading}
          variant="outline"
        >
          Test @therock (400M+ followers)
        </Button>

        <Button
          onClick={() => testWithKnownHandle("instagram")}
          disabled={loading}
          variant="outline"
        >
          Test @instagram (Official)
        </Button>

        <Button
          onClick={() => testWithKnownHandle("realkrsna")}
          disabled={loading}
          variant="outline"
        >
          Test @realkrsna (Original)
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Testing Instagram API...</p>
            </div>
          ) : result ? (
            <pre className="text-xs overflow-auto max-h-96 bg-muted p-3 rounded whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Click a test button to see results
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">What to look for:</h3>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>
                • <strong>Status 200:</strong> API call successful
              </li>
              <li>
                • <strong>Status 500:</strong> Server error (check API key)
              </li>
              <li>
                • <strong>success: true:</strong> Profile found and parsed
              </li>
              <li>
                • <strong>success: false:</strong> Profile not found or API
                error
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Common Issues:</h3>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Missing API key → Status 500</li>
              <li>• Invalid handle → success: false</li>
              <li>• Private account → success: false</li>
              <li>• Rate limiting → success: false</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
