"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  Download,
  Key,
  Globe,
  UserX,
} from "@/components/ui/icons";

interface PrivacySecurityProps {
  userId: string;
}

export function PrivacySecurity({ }: PrivacySecurityProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "private",
    boardsPublic: false,
    analyticsSharing: true,
    dataCollection: true,
    thirdPartySharing: false,
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const handleSavePrivacySettings = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement save privacy settings API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success("Privacy settings updated successfully");
    } catch (error) {
      toast.error("Failed to update privacy settings");
      console.error("Error saving privacy settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      // TODO: Implement data export functionality
      toast.success("Data export initiated. You'll receive an email when ready.");
      setExportDialogOpen(false);
    } catch (error) {
      toast.error("Failed to initiate data export");
      console.error("Error exporting data:", error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // TODO: Implement account deletion
      toast.success("Account deletion initiated. Please check your email.");
      setDeleteDialogOpen(false);
    } catch (error) {
      toast.error("Failed to delete account");
      console.error("Error deleting account:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privacy Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Profile Visibility</div>
                <div className="text-sm text-muted-foreground">
                  Control who can see your profile information
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={privacySettings.profileVisibility === "public" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPrivacySettings(prev => ({ 
                    ...prev, 
                    profileVisibility: "public" 
                  }))}
                >
                  <Globe className="w-4 h-4 mr-1" />
                  Public
                </Button>
                <Button
                  variant={privacySettings.profileVisibility === "private" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPrivacySettings(prev => ({ 
                    ...prev, 
                    profileVisibility: "private" 
                  }))}
                >
                  <Lock className="w-4 h-4 mr-1" />
                  Private
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Public Boards</div>
                <div className="text-sm text-muted-foreground">
                  Allow others to discover your public boards
                </div>
              </div>
              <Button
                variant={privacySettings.boardsPublic ? "default" : "outline"}
                size="sm"
                onClick={() => setPrivacySettings(prev => ({ 
                  ...prev, 
                  boardsPublic: !prev.boardsPublic 
                }))}
              >
                {privacySettings.boardsPublic ? (
                  <>
                    <Eye className="w-4 h-4 mr-1" />
                    Enabled
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4 mr-1" />
                    Disabled
                  </>
                )}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Analytics Sharing</div>
                <div className="text-sm text-muted-foreground">
                  Help improve the platform by sharing anonymous usage data
                </div>
              </div>
              <Button
                variant={privacySettings.analyticsSharing ? "default" : "outline"}
                size="sm"
                onClick={() => setPrivacySettings(prev => ({ 
                  ...prev, 
                  analyticsSharing: !prev.analyticsSharing 
                }))}
              >
                {privacySettings.analyticsSharing ? "Enabled" : "Disabled"}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Data Collection</div>
                <div className="text-sm text-muted-foreground">
                  Allow collection of usage data for personalization
                </div>
              </div>
              <Button
                variant={privacySettings.dataCollection ? "default" : "outline"}
                size="sm"
                onClick={() => setPrivacySettings(prev => ({ 
                  ...prev, 
                  dataCollection: !prev.dataCollection 
                }))}
              >
                {privacySettings.dataCollection ? "Enabled" : "Disabled"}
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <Button 
              onClick={handleSavePrivacySettings} 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              {isLoading ? "Saving..." : "Save Privacy Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Two-Factor Authentication</div>
                <div className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  Managed by Auth Provider
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Login Sessions</div>
                <div className="text-sm text-muted-foreground">
                  Manage your active login sessions
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Key className="w-4 h-4 mr-1" />
                View Sessions
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Password</div>
                <div className="text-sm text-muted-foreground">
                  Change your account password
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Lock className="w-4 h-4 mr-1" />
                Change Password
              </Button>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Security settings are managed through your authentication provider. 
              Some features may redirect you to your account settings.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Export Your Data</div>
                <div className="text-sm text-muted-foreground">
                  Download a copy of all your data
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setExportDialogOpen(true)}
              >
                <Download className="w-4 h-4 mr-1" />
                Export Data
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Data Retention</div>
                <div className="text-sm text-muted-foreground">
                  How long we keep your data
                </div>
              </div>
              <Badge variant="secondary">
                Indefinite (until deletion)
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Delete Account</div>
                <div className="text-sm text-muted-foreground">
                  Permanently delete your account and all data
                </div>
              </div>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <UserX className="w-4 h-4 mr-1" />
                Delete Account
              </Button>
            </div>
          </div>

          <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-destructive mb-1">Warning</div>
                <div className="text-muted-foreground">
                  Account deletion is permanent and cannot be undone. All your data, 
                  including saved posts, boards, and folders will be permanently deleted.
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Data Dialog */}
      <ConfirmDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        title="Export Your Data"
        description="We'll prepare a complete export of your data and send you a download link via email. This may take a few minutes to process."
        confirmText="Export Data"
        cancelText="Cancel"
        onConfirm={handleExportData}
        variant="default"
      />

      {/* Delete Account Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Account"
        description="Are you absolutely sure you want to delete your account? This action cannot be undone and will permanently delete all your data including saved posts, boards, and folders."
        confirmText="Delete Account"
        cancelText="Cancel"
        onConfirm={handleDeleteAccount}
        variant="destructive"
      />
    </div>
  );
} 