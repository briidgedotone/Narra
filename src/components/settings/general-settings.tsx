"use client";

import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User,
  Mail,
  Calendar,
  Bell,
  Moon,
  Sun,
  Monitor,
  Save,
} from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/utils/format";

interface GeneralSettingsProps {
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

export function GeneralSettings({ userId, userData }: GeneralSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    theme: "system",
    emailNotifications: true,
    pushNotifications: false,
    weeklyDigest: true,
    language: "en",
    timezone: "UTC",
  });

  const handleSavePreferences = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement save preferences API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success("Preferences saved successfully");
    } catch (error) {
      toast.error("Failed to save preferences");
      console.error("Error saving preferences:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Picture & Basic Info */}
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              {userData?.imageUrl ? (
                <Image
                  src={userData.imageUrl}
                  alt="Profile"
                  width={80}
                  height={80}
                  className="rounded-full border-2 border-border"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                  <User className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={userData?.firstName || ""}
                    placeholder="Enter your first name"
                    disabled
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={userData?.lastName || ""}
                    placeholder="Enter your last name"
                    disabled
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="email"
                    type="email"
                    value={userData?.email || ""}
                    disabled
                    className="flex-1"
                  />
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    Verified
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="pt-4 border-t border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Member since {userData?.createdAt ? formatDate(userData.createdAt.toISOString()) : "Unknown"}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="w-4 h-4" />
                <span>User ID: {userId.slice(0, 8)}...</span>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Profile information is managed through your authentication provider. 
              To update your name or email, please visit your account settings.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Selection */}
          <div className="space-y-2">
            <Label>Theme</Label>
            <Select
              value={preferences.theme}
              onValueChange={(value) => setPreferences(prev => ({ ...prev, theme: value }))}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4" />
                    Light
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4" />
                    Dark
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
                    System
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Language & Timezone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Language</Label>
              <Select
                value={preferences.language}
                onValueChange={(value) => setPreferences(prev => ({ ...prev, language: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select
                value={preferences.timezone}
                onValueChange={(value) => setPreferences(prev => ({ ...prev, timezone: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  <SelectItem value="Europe/London">London</SelectItem>
                  <SelectItem value="Europe/Paris">Paris</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-border">
            <Button 
              onClick={handleSavePreferences} 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isLoading ? "Saving..." : "Save Preferences"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Email Notifications</div>
                <div className="text-sm text-muted-foreground">
                  Receive updates about your account and content
                </div>
              </div>
              <Button
                variant={preferences.emailNotifications ? "default" : "outline"}
                size="sm"
                onClick={() => setPreferences(prev => ({ 
                  ...prev, 
                  emailNotifications: !prev.emailNotifications 
                }))}
              >
                {preferences.emailNotifications ? "Enabled" : "Disabled"}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Weekly Digest</div>
                <div className="text-sm text-muted-foreground">
                  Get a summary of your activity and new content
                </div>
              </div>
              <Button
                variant={preferences.weeklyDigest ? "default" : "outline"}
                size="sm"
                onClick={() => setPreferences(prev => ({ 
                  ...prev, 
                  weeklyDigest: !prev.weeklyDigest 
                }))}
              >
                {preferences.weeklyDigest ? "Enabled" : "Disabled"}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Push Notifications</div>
                <div className="text-sm text-muted-foreground">
                  Browser notifications for important updates
                </div>
              </div>
              <Button
                variant={preferences.pushNotifications ? "default" : "outline"}
                size="sm"
                onClick={() => setPreferences(prev => ({ 
                  ...prev, 
                  pushNotifications: !prev.pushNotifications 
                }))}
              >
                {preferences.pushNotifications ? "Enabled" : "Disabled"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 