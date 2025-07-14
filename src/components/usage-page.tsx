"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// import { Badge } from "@/components/ui/badge"; // Unused
import { Button } from "@/components/ui/button";

interface UsageData {
  plan_id: string;
  monthly_profile_discoveries: number;
  monthly_transcripts_viewed: number;
  current_follows?: number;
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
      const usageResponse = await fetch("/api/user/usage");
      const usageData = await usageResponse.json();

      const followsResponse = await fetch("/api/user/follows");
      const followsData = await followsResponse.json();

      const combinedUsage = {
        ...usageData,
        current_follows: followsData.current_follows || 0,
      };
      setUsage(combinedUsage);

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
        <div className="animate-pulse space-y-6">
          <div className="space-y-2">
            <div className="h-7 bg-muted rounded w-64" />
            <div className="h-4 bg-muted/60 rounded w-96" />
          </div>
          <div className="h-4 bg-muted/40 rounded w-80" />
          <div className="bg-card rounded-lg border p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="text-center space-y-3">
                  <div className="w-12 h-12 bg-muted rounded-lg mx-auto" />
                  <div className="space-y-2">
                    <div className="h-6 bg-muted rounded w-16 mx-auto" />
                    <div className="h-4 bg-muted/60 rounded w-20 mx-auto" />
                    <div className="h-3 bg-muted/40 rounded w-24 mx-auto" />
                  </div>
                  <div className="h-1.5 bg-muted rounded-full w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!usage || !planDetails) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <p className="text-muted-foreground font-medium mb-4">
            Unable to load usage data
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  // Calculate usage percentages and status
  const metrics = [
    {
      label: "Profile Searches",
      used: usage.monthly_profile_discoveries,
      limit: usage.limits.profile_discoveries,
      icon: "search",
      color: "blue",
      tooltip: "Number of social media profiles you've searched this month",
    },
    {
      label: "Transcripts",
      used: usage.monthly_transcripts_viewed,
      limit: usage.limits.transcript_views,
      icon: "document",
      color: "green",
      tooltip: "Number of video transcripts you've generated this month",
    },
    {
      label: "Active Follows",
      used: usage.current_follows || 0,
      limit: usage.limits.profile_follows,
      icon: "users",
      color: "purple",
      tooltip: "Number of profiles you're currently tracking for new content",
    },
    {
      label: "History Access",
      used: Math.floor(usage.limits.data_range_days / 30),
      limit: null,
      icon: "calendar",
      color: "orange",
      suffix: " months",
      tooltip: "How far back in time you can access historical post data",
    },
  ];

  const criticalMetrics = metrics.filter(
    m => m.limit && m.used / m.limit >= 0.9
  );
  const warningMetrics = metrics.filter(
    m => m.limit && m.used / m.limit >= 0.75 && m.used / m.limit < 0.9
  );

  const getStatusColor = (used: number, limit: number | null) => {
    if (!limit) return "text-foreground";
    const percentage = used / limit;
    if (percentage >= 0.9) return "text-destructive";
    if (percentage >= 0.75) return "text-yellow-600";
    return "text-foreground";
  };

  /* Unused function
  const getIconSvg = (iconType: string, className: string) => {
    const icons = {
      search: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />,
      document: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c0 .621-.504 1.125-1.125 1.125H9.375c-.621 0-1.125-.504-1.125-1.125V18.75m2.25-3H6.375c-.621 0-1.125.504-1.125 1.125v3.375c0 .621.504 1.125 1.125 1.125h3.75m2.25-16.125V5.25A2.25 2.25 0 0 1 15.75 3h1.5a2.25 2.25 0 0 1 2.25 2.25v1.5A2.25 2.25 0 0 1 17.25 9h-1.5a2.25 2.25 0 0 1-2.25-2.25Z" />,
      users: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />,
      calendar: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5a2.25 2.25 0 0 0 2.25-2.25m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5a2.25 2.25 0 0 1 2.25 2.25v7.5" />
    };
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {icons[iconType as keyof typeof icons]}
      </svg>
    );
  };
  */

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Usage & Billing</h1>
          <p className="text-muted-foreground">
            Monitor your {planDetails.name} plan usage and manage your
            subscription
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Indicator */}
          {(criticalMetrics.length > 0 || warningMetrics.length > 0) && (
            <>
              {criticalMetrics.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-destructive/10 border border-destructive/20 rounded-full">
                  <div className="w-1.5 h-1.5 bg-destructive rounded-full animate-pulse" />
                  <span className="text-xs font-medium text-destructive">
                    Limits Reached
                  </span>
                </div>
              )}
              {warningMetrics.length > 0 && criticalMetrics.length === 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-full">
                  <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
                  <span className="text-xs font-medium text-yellow-700">
                    Approaching Limits
                  </span>
                </div>
              )}
            </>
          )}

          {/* Action Buttons */}
          <Button
            variant="outline"
            onClick={() => router.push("/select-plan")}
            size="sm"
          >
            Upgrade Plan
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open("https://billing.stripe.com/", "_blank")}
            size="sm"
          >
            Manage Billing
          </Button>
        </div>
      </div>

      {/* Plan & Usage Overview */}
      <div className="bg-card rounded-lg border overflow-hidden">
        {/* Plan Details */}
        <div className="p-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-8">
                {planDetails.name} Plan
              </h2>
              <div className="flex items-baseline gap-2">
                <div className="text-4xl font-bold text-foreground">
                  ${planDetails.price_monthly}
                </div>
                <div className="text-sm text-muted-foreground">per month</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground flex items-center justify-end gap-2">
                Next billing date
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                  {new Date(
                    Date.now() + 30 * 24 * 60 * 60 * 1000
                  ).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border"></div>

        {/* Usage Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-x divide-border">
          {metrics.map((metric, index) => {
            const percentage = metric.limit
              ? (metric.used / metric.limit) * 100
              : null;

            return (
              <div key={index} className="text-left p-8">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div
                      className={`text-3xl font-bold mb-2 ${getStatusColor(
                        metric.used,
                        metric.limit
                      )}`}
                    >
                      {metric.used.toLocaleString()}
                      {metric.suffix || ""}
                      {metric.limit && (
                        <span className="text-sm font-normal text-muted-foreground ml-2">
                          / {metric.limit.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-foreground">
                        {metric.label}
                      </span>
                      <button className="text-muted-foreground hover:text-foreground transition-colors">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Circular Progress */}
                  {metric.limit && (
                    <div className="relative w-16 h-16 ml-4">
                      <svg
                        className="w-16 h-16 transform -rotate-90"
                        viewBox="0 0 64 64"
                      >
                        {/* Background Circle */}
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          className="text-gray-200"
                        />
                        {/* Progress Circle */}
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 28}`}
                          strokeDashoffset={`${2 * Math.PI * 28 * (1 - (percentage || 0) / 100)}`}
                          className={`transition-all duration-700 ease-out ${
                            index === 0
                              ? "text-red-500"
                              : index === 1
                                ? "text-blue-500"
                                : index === 2
                                  ? "text-green-500"
                                  : "text-purple-500"
                          }`}
                          strokeLinecap="round"
                        />
                      </svg>
                      {/* Percentage Text */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-semibold text-foreground">
                          {Math.round(percentage || 0)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upgrade Prompt */}
      {(criticalMetrics.length > 0 || warningMetrics.length > 0) && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-foreground">
                {criticalMetrics.length > 0
                  ? "Action Required"
                  : "Consider Upgrading"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {criticalMetrics.length > 0
                  ? "You've reached your usage limits. Upgrade to continue your workflow."
                  : "You're approaching your usage limits. Upgrade to ensure uninterrupted access."}
              </p>
            </div>
            <Button onClick={() => router.push("/select-plan")} size="sm">
              {criticalMetrics.length > 0 ? "Upgrade Now" : "View Plans"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
