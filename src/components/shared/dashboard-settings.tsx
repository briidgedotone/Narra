"use client";

import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Settings, Eye, EyeOff } from "@/components/ui/icons";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

// Dashboard settings type
export interface DashboardSettings {
  viewMode: "comfortable" | "compact";
  showStats: boolean;
  showActivity: boolean;
  showQuickActions: boolean;
  theme: "light" | "dark" | "system";
}

// Default settings
const defaultSettings: DashboardSettings = {
  viewMode: "comfortable",
  showStats: true,
  showActivity: true,
  showQuickActions: true,
  theme: "system",
};

// Hook for managing dashboard settings
export function useDashboardSettings() {
  const [settings, setSettings] = useState<DashboardSettings>(defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("dashboard-settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings({ ...defaultSettings, ...parsed });
      }
    } catch (error) {
      console.error("Error loading dashboard settings:", error);
    }
  }, []);

  // Save settings to localStorage when they change
  const updateSettings = (newSettings: Partial<DashboardSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);

    try {
      localStorage.setItem("dashboard-settings", JSON.stringify(updated));
    } catch (error) {
      console.error("Error saving dashboard settings:", error);
    }
  };

  return { settings, updateSettings };
}

// Settings modal component
interface DashboardSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: DashboardSettings;
  onSettingsChange: (settings: Partial<DashboardSettings>) => void;
}

export function DashboardSettingsModal({
  open,
  onOpenChange,
  settings,
  onSettingsChange,
}: DashboardSettingsModalProps) {
  const toggleSetting = (key: keyof DashboardSettings) => {
    if (typeof settings[key] === "boolean") {
      onSettingsChange({ [key]: !settings[key] });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Dashboard Settings
          </DialogTitle>
          <DialogDescription>
            Customize your dashboard layout and preferences.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* View Mode */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">View Mode</Label>
            <Select
              value={settings.viewMode}
              onValueChange={(value: string) =>
                onSettingsChange({
                  viewMode: value as "comfortable" | "compact",
                })
              }
              options={[
                { value: "comfortable", label: "Comfortable" },
                { value: "compact", label: "Compact" },
              ]}
            />
          </div>

          {/* Theme */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Theme</Label>
            <Select
              value={settings.theme}
              onValueChange={(value: string) =>
                onSettingsChange({
                  theme: value as "light" | "dark" | "system",
                })
              }
              options={[
                { value: "light", label: "Light" },
                { value: "dark", label: "Dark" },
                { value: "system", label: "System" },
              ]}
            />
          </div>

          {/* Visibility Settings */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Dashboard Sections</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Statistics Cards</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSetting("showStats")}
                  className="h-8 w-8 p-0"
                >
                  {settings.showStats ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Recent Activity</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSetting("showActivity")}
                  className="h-8 w-8 p-0"
                >
                  {settings.showActivity ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Quick Actions</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSetting("showQuickActions")}
                  className="h-8 w-8 p-0"
                >
                  {settings.showQuickActions ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Reset Button */}
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onSettingsChange(defaultSettings)}
              className="w-full"
            >
              Reset to Defaults
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
