"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User,
  BarChart3,
  Shield,
  CreditCard,
} from "@/components/ui/icons";
import { cn } from "@/lib/utils";

import { AnalyticsInsights } from "./analytics-insights";
import { GeneralSettings } from "./general-settings";
import { PrivacySecurity } from "./privacy-security";
import { SubscriptionBilling } from "./subscription-billing";

interface SettingsContentProps {
  userId: string;
  userData: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    imageUrl: string;
    createdAt: Date;
  } | null;
}

type SettingsTab = "general" | "analytics" | "privacy" | "billing";

const settingsTabs = [
  {
    id: "general" as const,
    label: "General Settings",
    icon: User,
    description: "Profile and account preferences",
  },
  {
    id: "analytics" as const,
    label: "Analytics & Insights",
    icon: BarChart3,
    description: "Usage statistics and insights",
  },
  {
    id: "privacy" as const,
    label: "Privacy & Security",
    icon: Shield,
    description: "Data and security settings",
  },
  {
    id: "billing" as const,
    label: "Subscription & Billing",
    icon: CreditCard,
    description: "Plan and payment management",
  },
];

export function SettingsContent({ userId, userData }: SettingsContentProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return <GeneralSettings userId={userId} userData={userData} />;
      case "analytics":
        return <AnalyticsInsights userId={userId} />;
      case "privacy":
        return <PrivacySecurity userId={userId} />;
      case "billing":
        return <SubscriptionBilling userId={userId} />;
      default:
        return <GeneralSettings userId={userId} userData={userData} />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Settings Navigation */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Settings</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <nav className="space-y-1">
              {settingsTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <Button
                    key={tab.id}
                    variant="ghost"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "w-full justify-start text-left h-auto p-4 rounded-none",
                      activeTab === tab.id
                        ? "bg-primary/10 text-primary border-r-2 border-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <div className="text-left">
                        <div className="font-medium">{tab.label}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {tab.description}
                        </div>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </nav>
          </CardContent>
        </Card>
      </div>

      {/* Settings Content */}
      <div className="lg:col-span-3">
        {renderTabContent()}
      </div>
    </div>
  );
} 