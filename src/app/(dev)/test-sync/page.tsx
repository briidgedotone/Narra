"use client";

import { useUser } from "@clerk/nextjs";
import { useState } from "react";

import { syncCurrentUserToDatabase } from "@/app/actions/user-sync";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function TestSyncPage() {
  const { user, isLoaded } = useUser();
  const [syncResult, setSyncResult] = useState<{
    success: boolean;
    user?: {
      id: string;
      email: string;
      role: string;
      subscriptionStatus: string;
    };
    error?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSync = async () => {
    setIsLoading(true);
    setSyncResult(null);

    try {
      const result = await syncCurrentUserToDatabase();
      setSyncResult(result);
    } catch (error) {
      setSyncResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded) {
    return <div className="p-8">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="container mx-auto p-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">User Sync Test</h1>
          <p className="text-muted-foreground">
            Please sign in to test user database synchronization.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">User Database Sync Test</h1>
          <p className="text-muted-foreground mt-2">
            Test synchronization between Clerk and our PostgreSQL database
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Clerk User Information</CardTitle>
            <CardDescription>
              Current user data from Clerk authentication
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <strong>User ID:</strong> {user.id}
            </div>
            <div>
              <strong>Email:</strong> {user.primaryEmailAddress?.emailAddress}
            </div>
            <div>
              <strong>Name:</strong> {user.firstName} {user.lastName}
            </div>
            <div>
              <strong>Created:</strong>{" "}
              {user.createdAt
                ? new Date(user.createdAt).toLocaleString()
                : "N/A"}
            </div>
            <div>
              <strong>Auth Method:</strong>{" "}
              {user.externalAccounts?.length > 0
                ? `OAuth (${user.externalAccounts[0]?.provider})`
                : "Email/Password"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Database Synchronization</CardTitle>
            <CardDescription>
              Sync this user to our PostgreSQL database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleSync}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Syncing..." : "Sync User to Database"}
            </Button>

            {syncResult && (
              <div
                className={`p-4 rounded-lg ${
                  syncResult.success
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                {syncResult.success ? (
                  <div className="space-y-2">
                    <p className="font-semibold text-green-800">
                      ✅ User successfully synced to database!
                    </p>
                    <div className="text-sm text-green-700 space-y-1">
                      <div>
                        <strong>Database ID:</strong> {syncResult.user.id}
                      </div>
                      <div>
                        <strong>Email:</strong> {syncResult.user.email}
                      </div>
                      <div>
                        <strong>Role:</strong> {syncResult.user.role}
                      </div>
                      <div>
                        <strong>Subscription:</strong>{" "}
                        {syncResult.user.subscriptionStatus}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="font-semibold text-red-800">
                      ❌ Database sync failed
                    </p>
                    <p className="text-sm text-red-700 mt-1">
                      Error: {syncResult.error}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How User Sync Works</CardTitle>
            <CardDescription>
              Understanding the synchronization process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>User authenticates with Clerk (email/password or OAuth)</li>
              <li>Dashboard automatically syncs user to our database</li>
              <li>
                User record created with default role and subscription status
              </li>
              <li>
                Future updates sync email changes but preserve role/subscription
              </li>
              <li>
                Database enables features like content saving, folders, etc.
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
