"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface UsageData {
  plan_id: string;
  monthly_profile_discoveries: number;
  monthly_transcripts_viewed: number;
  limits: {
    profile_discoveries: number;
    transcript_views: number;
    profile_follows: number;
  };
}

export function UsageDisplay() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      const response = await fetch("/api/user/usage");
      const data = await response.json();
      setUsage(data);
    } catch (error) {
      console.error("Failed to fetch usage:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !usage) return null;

  const profilePercentage =
    (usage.monthly_profile_discoveries / usage.limits.profile_discoveries) *
    100;
  const transcriptPercentage =
    (usage.monthly_transcripts_viewed / usage.limits.transcript_views) * 100;

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">
          {usage.plan_id === "growth" ? "Growth Plan" : "Inspiration Plan"}
        </h3>
        {(profilePercentage >= 80 || transcriptPercentage >= 80) && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push("/select-plan")}
            className="text-xs"
          >
            Upgrade
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {/* Profile Discoveries */}
        <div>
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Profile Discoveries</span>
            <span>
              {usage.monthly_profile_discoveries} /{" "}
              {usage.limits.profile_discoveries}
            </span>
          </div>
          <Progress value={profilePercentage} className="h-2" />
        </div>

        {/* Transcript Views */}
        <div>
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Transcript Views</span>
            <span>
              {usage.monthly_transcripts_viewed} /{" "}
              {usage.limits.transcript_views}
            </span>
          </div>
          <Progress value={transcriptPercentage} className="h-2" />
        </div>
      </div>

      {profilePercentage >= 100 && (
        <div className="mt-3 p-2 bg-red-50 rounded text-xs text-red-600">
          Profile discovery limit reached. Upgrade to continue searching.
        </div>
      )}
    </div>
  );
}
