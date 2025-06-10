"use client";

import { useState } from "react";

import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { ConfirmDialog } from "./confirm-dialog";
import { ErrorMessage } from "./error-message";
import { Loading } from "./loading";
import { Modal } from "./modal";

export function ColorTest() {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="content-spacing">
      <Card>
        <CardHeader>
          <CardTitle>Use Narra Design System Test</CardTitle>
        </CardHeader>
        <CardContent className="content-spacing">
          {/* Primary Colors */}
          <div className="space-y-2">
            <h3 className="font-semibold">Primary (Purple/Violet)</h3>
            <div className="flex gap-2">
              <Button>Primary Button</Button>
              <div className="w-16 h-16 bg-primary rounded-md"></div>
            </div>
          </div>

          {/* Secondary Colors */}
          <div className="space-y-2">
            <h3 className="font-semibold">Secondary (Blue)</h3>
            <div className="flex gap-2">
              <Button variant="secondary">Secondary Button</Button>
              <div className="w-16 h-16 bg-secondary rounded-md"></div>
            </div>
          </div>

          {/* Accent Colors */}
          <div className="space-y-2">
            <h3 className="font-semibold">Accent (Yellow/Orange)</h3>
            <div className="flex gap-2">
              <div className="px-3 py-1 bg-accent text-accent-foreground rounded-md font-medium">
                SCHEDULED
              </div>
              <div className="w-16 h-16 bg-accent rounded-md"></div>
            </div>
          </div>

          {/* Typography System */}
          <div className="space-y-2">
            <h3 className="font-semibold">Typography System</h3>
            <div className="p-4 bg-muted rounded-md space-y-3">
              <h1>Heading 1 - Main Titles</h1>
              <h2>Heading 2 - Section Titles</h2>
              <h3>Heading 3 - Subsections</h3>
              <h4>Heading 4 - Small Headers</h4>
              <p>
                Regular paragraph text with proper line height and spacing for
                comfortable reading.
              </p>
              <p className="text-small">Small text for secondary information</p>
              <p className="text-caption">Caption text for labels</p>
            </div>
          </div>

          {/* Spacing System */}
          <div className="space-y-2">
            <h3 className="font-semibold">Spacing & Layout System</h3>
            <div className="bg-muted rounded-md card-spacing">
              <h4>Card Spacing Example</h4>
              <p className="text-small">
                This card uses the card-spacing utility for consistent padding.
              </p>
            </div>
            <div className="bg-muted rounded-md p-4">
              <div className="content-spacing">
                <h4>Content Spacing Example</h4>
                <p className="text-small">
                  Multiple items with content-spacing utility.
                </p>
                <p className="text-small">
                  Creates consistent vertical rhythm.
                </p>
              </div>
            </div>
          </div>

          {/* Loading & Error States */}
          <div className="space-y-2">
            <h3 className="font-semibold">Loading & Error Components</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted rounded-md p-4">
                <h4 className="mb-2">Loading State</h4>
                <div className="bg-background rounded-md">
                  <Loading size="sm" text="Loading data..." />
                </div>
              </div>
              <div className="bg-muted rounded-md p-4">
                <h4 className="mb-2">Error State</h4>
                <div className="bg-background rounded-md">
                  <ErrorMessage
                    title="Test Error"
                    message="This is a sample error message"
                    showIcon={false}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Modal & Dialog Components */}
          <div className="space-y-2">
            <h3 className="font-semibold">Modal & Dialog Components</h3>
            <div className="flex gap-2">
              <Modal
                trigger={<Button variant="outline">Open Modal</Button>}
                title="Example Modal"
                description="This is a sample modal dialog"
              >
                <div className="space-y-4">
                  <p>
                    This is the modal content area. You can put any content
                    here.
                  </p>
                  <div className="flex justify-end">
                    <Button>Done</Button>
                  </div>
                </div>
              </Modal>

              <Button
                variant="destructive"
                onClick={() => setConfirmOpen(true)}
              >
                Delete Action
              </Button>
            </div>
          </div>

          {/* Background Colors */}
          <div className="space-y-2">
            <h3 className="font-semibold">Background & Text</h3>
            <div className="p-4 bg-muted rounded-md">
              <p className="text-foreground">
                Primary text on muted background
              </p>
              <p className="text-muted-foreground">Secondary text color</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirm Delete"
        description="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={() => {
          // Handle delete action
          console.log("Item deleted");
        }}
      />
    </div>
  );
}
