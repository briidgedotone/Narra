"use client";

import {
  Crown,
  Search,
  FileText,
  Users,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface UsageData {
  plan_id: string;
  monthly_profile_discoveries: number;
  monthly_transcripts_viewed: number;
  limits: {
    profile_discoveries: number;
    transcript_views: number;
    profile_follows: number;
    data_range_days: number;
  };
}

interface PlanDetails {
  name: string;
  price_monthly: number;
  price_yearly: number;
  features: Record<string, boolean>;
}

export function UsagePage() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [planDetails, setPlanDetails] = useState<PlanDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch usage data
      const usageResponse = await fetch("/api/user/usage");
      const usageData = await usageResponse.json();
      setUsage(usageData);

      // Fetch plan details
      const planResponse = await fetch(`/api/plans/${usageData.plan_id}`);
      const planData = await planResponse.json();
      setPlanDetails(planData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="h-48 bg-gray-200 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!usage || !planDetails) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Unable to load usage data</p>
      </div>
    );
  }

  const profilePercentage =
    (usage.monthly_profile_discoveries / usage.limits.profile_discoveries) *
    100;
  const transcriptPercentage =
    (usage.monthly_transcripts_viewed / usage.limits.transcript_views) * 100;

  const isNearLimit = profilePercentage >= 80 || transcriptPercentage >= 80;
  const isAtLimit = profilePercentage >= 100 || transcriptPercentage >= 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Usage & Billing</h1>
          <p className="text-gray-600 mt-1">
            Monitor your plan usage and manage your subscription
          </p>
        </div>
        {isNearLimit && (
          <Button
            onClick={() => router.push("/select-plan")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Crown className="w-4 h-4 mr-2" />
            Upgrade Plan
          </Button>
        )}
      </div>

      {/* Current Plan Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                {planDetails.name}
              </CardTitle>
              <CardDescription>
                ${planDetails.price_monthly}/month • ${planDetails.price_yearly}
                /year
              </CardDescription>
            </div>
            <Badge
              variant={usage.plan_id === "growth" ? "default" : "secondary"}
              className="text-sm"
            >
              {usage.plan_id === "growth" ? "Pro" : "Basic"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {usage.limits.profile_discoveries}
              </div>
              <div className="text-sm text-gray-500">Profile Searches</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {usage.limits.transcript_views}
              </div>
              <div className="text-sm text-gray-500">Transcript Views</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {usage.limits.profile_follows}
              </div>
              <div className="text-sm text-gray-500">Profile Follows</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {usage.limits.data_range_days}
              </div>
              <div className="text-sm text-gray-500">Days History</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Discoveries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-500" />
              Profile Discoveries
            </CardTitle>
            <CardDescription>Monthly profile search usage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Used this month</span>
              <span className="font-medium">
                {usage.monthly_profile_discoveries} /{" "}
                {usage.limits.profile_discoveries}
              </span>
            </div>
            <Progress value={profilePercentage} className="h-3" />
            <div className="text-sm text-gray-500">
              {usage.limits.profile_discoveries -
                usage.monthly_profile_discoveries}{" "}
              searches remaining
            </div>
            {profilePercentage >= 100 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm font-medium">
                  Limit Reached
                </p>
                <p className="text-red-500 text-xs">
                  Upgrade to continue discovering profiles
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transcript Views */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-500" />
              Transcript Views
            </CardTitle>
            <CardDescription>Monthly transcript access usage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Used this month</span>
              <span className="font-medium">
                {usage.monthly_transcripts_viewed} /{" "}
                {usage.limits.transcript_views}
              </span>
            </div>
            <Progress value={transcriptPercentage} className="h-3" />
            <div className="text-sm text-gray-500">
              {usage.limits.transcript_views - usage.monthly_transcripts_viewed}{" "}
              views remaining
            </div>
            {transcriptPercentage >= 100 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm font-medium">
                  Limit Reached
                </p>
                <p className="text-red-500 text-xs">
                  Upgrade to view more transcripts
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profile Follows */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              Profile Follows
            </CardTitle>
            <CardDescription>24/7 tracking capacity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Currently following</span>
              <span className="font-medium">
                0 / {usage.limits.profile_follows}
              </span>
            </div>
            <Progress value={0} className="h-3" />
            <div className="text-sm text-gray-500">
              {usage.limits.profile_follows} profiles available for tracking
            </div>
          </CardContent>
        </Card>

        {/* Data Range */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-500" />
              Data Range
            </CardTitle>
            <CardDescription>Historical data access</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Available history</span>
              <span className="font-medium">
                {usage.limits.data_range_days} days
              </span>
            </div>
            <div className="text-center py-4">
              <TrendingUp className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Access posts from the past{" "}
                {Math.floor(usage.limits.data_range_days / 30)} months
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={() => router.push("/select-plan")}
          className="flex-1"
        >
          View All Plans
        </Button>
        <Button
          onClick={() => window.open("https://billing.stripe.com/", "_blank")}
          className="flex-1"
        >
          Manage Billing
        </Button>
      </div>

      {/* Warning for near limits */}
      {isNearLimit && !isAtLimit && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              <p className="text-yellow-800 font-medium">
                Approaching usage limits
              </p>
            </div>
            <p className="text-yellow-700 text-sm mt-1">
              Consider upgrading to avoid interruptions in your workflow.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
