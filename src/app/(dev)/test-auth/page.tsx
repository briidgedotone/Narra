"use client";

import { useUser, useAuth } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function TestAuthPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useAuth();
  const [configStatus, setConfigStatus] = useState<string>("Not tested");

  const testClerkConfig = () => {
    setConfigStatus("Testing...");

    const hasPublishableKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    const hasCorrectFormat =
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith("pk_");

    if (!hasPublishableKey) {
      setConfigStatus("❌ Missing publishable key");
      return;
    }

    if (!hasCorrectFormat) {
      setConfigStatus("❌ Invalid publishable key format");
      return;
    }

    setConfigStatus("✅ Clerk configuration looks good");
  };

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Authentication Test Page</h1>
          <p className="text-muted-foreground mt-2">
            Test and verify Clerk authentication setup
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Clerk Configuration</CardTitle>
            <CardDescription>
              Check if Clerk is properly configured
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Publishable Key:</strong>
                <br />
                {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
                  ? "✅ Set"
                  : "❌ Missing"}
              </div>
              <div>
                <strong>Format Check:</strong>
                <br />
                {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith(
                  "pk_"
                )
                  ? "✅ Valid"
                  : "❌ Invalid"}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button onClick={testClerkConfig} className="w-full">
                Test Clerk Configuration
              </Button>
              <div className="text-center text-sm">
                Status: <span className="font-mono">{configStatus}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
            <CardDescription>Current user authentication state</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isLoaded && <div className="text-center">Loading...</div>}

            {isLoaded && !isSignedIn && (
              <div className="space-y-3">
                <div className="text-center">
                  <p>❌ Not signed in</p>
                  <p className="text-sm text-muted-foreground">
                    Authentication is working but no user is signed in
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button asChild className="flex-1">
                    <Link href="/sign-in">Test Sign In</Link>
                  </Button>
                  <Button asChild variant="outline" className="flex-1">
                    <Link href="/sign-up">Test Sign Up</Link>
                  </Button>
                </div>
              </div>
            )}

            {isLoaded && isSignedIn && user && (
              <div className="space-y-3">
                <div className="text-center">
                  <p>✅ Signed in successfully!</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>User ID:</strong> {user.id}
                  </div>
                  <div>
                    <strong>Email:</strong>{" "}
                    {user.primaryEmailAddress?.emailAddress}
                  </div>
                  <div>
                    <strong>Name:</strong> {user.firstName} {user.lastName}
                  </div>
                  <div>
                    <strong>Auth Method:</strong>{" "}
                    {user.externalAccounts?.length > 0
                      ? `OAuth (${user.externalAccounts[0]?.provider})`
                      : "Email/Password"}
                  </div>
                  {user.imageUrl && (
                    <div>
                      <strong>Profile Image:</strong>{" "}
                      <Image
                        src={user.imageUrl}
                        alt="Profile"
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full inline-block ml-2"
                      />
                    </div>
                  )}
                </div>
                <Button
                  onClick={() => signOut()}
                  variant="outline"
                  className="w-full"
                >
                  Sign Out
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Google OAuth Test</CardTitle>
            <CardDescription>
              Test Google authentication integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                If Google OAuth is enabled in Clerk, you should see a
                &ldquo;Continue with Google&rdquo; button on the sign-in and
                sign-up pages.
              </p>
              <div className="flex gap-2">
                <Button asChild size="sm">
                  <Link href="/sign-in">Test Google Sign In</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/sign-up">Test Google Sign Up</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
            <CardDescription>Authentication setup progress</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>✅ Clerk keys configured</li>
              <li>✅ Sign-in and sign-up pages created</li>
              <li>✅ Dashboard protection working</li>
              <li>✅ Google OAuth enabled</li>
              <li>🔄 Test Google authentication flow</li>
              <li>⏳ User database synchronization</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
