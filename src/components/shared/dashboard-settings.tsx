"use client";

import { Settings, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export interface DashboardSettings {
  showStats: boolean;
  showActivity: boolean;
  showQuickActions: boolean;
  viewMode: "compact" | "expanded";
}

interface DashboardSettingsProps {
  settings: DashboardSettings;
  onSettingsChange: (settings: DashboardSettings) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const defaultSettings: DashboardSettings = {
  showStats: true,
  showActivity: true,
  showQuickActions: true,
  viewMode: "expanded",
};

export function DashboardSettingsModal({
  settings,
  onSettingsChange,
  open,
  onOpenChange,
}: DashboardSettingsProps) {
  const [localSettings, setLocalSettings] =
    useState<DashboardSettings>(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    onSettingsChange(localSettings);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setLocalSettings(settings);
    onOpenChange(false);
  };

  const handleToggle = (
    key: keyof DashboardSettings,
    value: boolean | string
  ) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={handleCancel}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "0",
          maxWidth: "500px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          border: "1px solid #e5e7eb",
        }}
        onClick={e => e.stopPropagation()}
      >
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Settings className="h-5 w-5" />
              Dashboard Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Section Visibility */}
            <div>
              <h3 className="font-medium mb-4">Section Visibility</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    {localSettings.showStats ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                    Statistics Cards
                  </Label>
                  <Button
                    variant={localSettings.showStats ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      handleToggle("showStats", !localSettings.showStats)
                    }
                  >
                    {localSettings.showStats ? "Visible" : "Hidden"}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    {localSettings.showActivity ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                    Recent Activity
                  </Label>
                  <Button
                    variant={localSettings.showActivity ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      handleToggle("showActivity", !localSettings.showActivity)
                    }
                  >
                    {localSettings.showActivity ? "Visible" : "Hidden"}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    {localSettings.showQuickActions ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                    Quick Actions
                  </Label>
                  <Button
                    variant={
                      localSettings.showQuickActions ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      handleToggle(
                        "showQuickActions",
                        !localSettings.showQuickActions
                      )
                    }
                  >
                    {localSettings.showQuickActions ? "Visible" : "Hidden"}
                  </Button>
                </div>
              </div>
            </div>

            {/* View Mode */}
            <div>
              <h3 className="font-medium mb-4">View Mode</h3>
              <div className="flex gap-2">
                <Button
                  variant={
                    localSettings.viewMode === "compact" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => handleToggle("viewMode", "compact")}
                  className="flex-1"
                >
                  Compact
                </Button>
                <Button
                  variant={
                    localSettings.viewMode === "expanded"
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => handleToggle("viewMode", "expanded")}
                  className="flex-1"
                >
                  Expanded
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {localSettings.viewMode === "compact"
                  ? "Compact view shows more content in less space"
                  : "Expanded view provides more spacing and larger elements"}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleCancel}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleSave} className="flex-1">
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Hook for managing dashboard settings
export function useDashboardSettings() {
  const [settings, setSettings] = useState<DashboardSettings>(defaultSettings);

  useEffect(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem("dashboard-settings");
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (error) {
        console.error("Error loading dashboard settings:", error);
      }
    }
  }, []);

  const updateSettings = (newSettings: DashboardSettings) => {
    setSettings(newSettings);
    localStorage.setItem("dashboard-settings", JSON.stringify(newSettings));
  };

  return { settings, updateSettings };
}
