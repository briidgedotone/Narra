"use client";

import { useState } from "react";

import { BoardCard } from "@/components/shared/board-card";
import { mockBoards } from "@/lib/data/mock-boards";

import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { ConfirmDialog } from "./confirm-dialog";
import { ErrorMessage } from "./error-message";
import {
  Form,
  FormInput,
  FormTextarea,
  FormSelect,
  FormSubmit,
  FormErrorSummary,
  useNarraForm,
  contactFormSchema,
  boardCreateSchema,
  type ContactFormData,
  type BoardCreateData,
} from "./form";
import { Loading } from "./loading";
import { Modal } from "./modal";

export function ColorTest() {
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Form examples
  const contactForm = useNarraForm(contactFormSchema, {
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const boardForm = useNarraForm(boardCreateSchema, {
    name: "",
    description: "",
    folderId: undefined,
  });

  const handleContactSubmit = (data: ContactFormData) => {
    console.log("Contact form submitted:", data);
    // Simulate API call
    setTimeout(() => {
      alert("Message sent successfully!");
      contactForm.reset();
    }, 1000);
  };

  const handleBoardSubmit = (data: BoardCreateData) => {
    console.log("Board form submitted:", data);
    // Simulate board creation
    setTimeout(() => {
      alert(`Board "${data.name}" created successfully!`);
      boardForm.reset();
    }, 1000);
  };

  return (
    <div className="content-spacing">
      <Card>
        <CardHeader>
          <CardTitle>Use Narra Design System Test</CardTitle>
        </CardHeader>
        <CardContent className="content-spacing">
          {/* Primary Colors */}
          <div className="space-y-2">
            <h3 className="font-semibold">Primary (Dark Blue)</h3>
            <div className="flex gap-2">
              <Button>Primary Button</Button>
              <div className="w-16 h-16 bg-primary rounded-md"></div>
            </div>
          </div>

          {/* Secondary Colors */}
          <div className="space-y-2">
            <h3 className="font-semibold">Secondary (Medium Blue)</h3>
            <div className="flex gap-2">
              <Button variant="secondary">Secondary Button</Button>
              <div className="w-16 h-16 bg-secondary rounded-md"></div>
            </div>
          </div>

          {/* Accent Colors */}
          <div className="space-y-2">
            <h3 className="font-semibold">Accent (Light Purple/Pink)</h3>
            <div className="flex gap-2">
              <div className="px-3 py-1 bg-accent text-accent-foreground rounded-md font-medium">
                SOFT
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
              <p className="text-base">Regular paragraph text</p>
              <p className="text-small">Small text for captions</p>
              <p className="text-muted-foreground">Muted text</p>
            </div>
          </div>

          {/* Status Colors */}
          <div className="space-y-2">
            <h3 className="font-semibold">Status Colors</h3>
            <div className="flex gap-2">
              <Button variant="success">Success</Button>
              <Button variant="warning">Warning</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
          </div>

          {/* Button Variants */}
          <div className="space-y-2">
            <h3 className="font-semibold">Button Variants</h3>
            <div className="flex gap-2 flex-wrap">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
              <Button variant="soft">Soft</Button>
              <Button variant="gradient">Gradient</Button>
            </div>
          </div>

          {/* Loading States */}
          <div className="space-y-2">
            <h3 className="font-semibold">Loading States</h3>
            <div className="space-y-4">
              <Loading text="Loading data..." />
              <Loading size="sm" />
              <Loading size="lg" text="Processing..." />
            </div>
          </div>

          {/* Error States */}
          <div className="space-y-2">
            <h3 className="font-semibold">Error States</h3>
            <ErrorMessage
              title="Example Error"
              message="This is an example error message to test the error component."
              onRetry={() => alert("Retry clicked!")}
            />
          </div>

          {/* Board Cards */}
          <div className="space-y-2">
            <h3 className="font-semibold">Board Cards</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockBoards.slice(0, 3).map(board => (
                <BoardCard
                  key={board.id}
                  board={board}
                  onEdit={board => alert(`Edit board: ${board.name}`)}
                  onDelete={board => alert(`Delete board: ${board.name}`)}
                  onShare={board => alert(`Share board: ${board.name}`)}
                />
              ))}
            </div>
          </div>

          {/* Modal & Dialog Components */}
          <div className="space-y-2">
            <h3 className="font-semibold">Modal & Dialog Components</h3>
            <div className="flex gap-2">
              <Modal
                trigger={<Button variant="outline">Open Modal</Button>}
                title="Example Modal"
                description="This is an example modal with content."
              >
                <div className="space-y-4">
                  <p>
                    This is the modal content. You can put forms, images, or any
                    other content here.
                  </p>
                  <p>
                    Modals are great for focused interactions without leaving
                    the current page.
                  </p>
                </div>
              </Modal>

              <Button variant="outline" onClick={() => setConfirmOpen(true)}>
                Open Confirm Dialog
              </Button>

              <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Confirm Action"
                description="Are you sure you want to perform this action? This cannot be undone."
                onConfirm={() => {
                  alert("Action confirmed!");
                  setConfirmOpen(false);
                }}
              />
            </div>
          </div>

          {/* Form Components */}
          <div className="space-y-2">
            <h3 className="font-semibold">Form Components</h3>

            {/* Contact Form Example */}
            <div className="max-w-md">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">
                Contact Form Example
              </h4>
              <Form
                form={contactForm}
                onSubmit={handleContactSubmit}
                className="space-y-4"
              >
                <FormInput name="name" label="Name" required />
                <FormInput name="email" label="Email" type="email" required />
                <FormInput name="subject" label="Subject" required />
                <FormTextarea name="message" label="Message" required />
                <FormErrorSummary />
                <FormSubmit>Send Message</FormSubmit>
              </Form>
            </div>

            {/* Board Creation Form Example */}
            <div className="max-w-md">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">
                Board Creation Form
              </h4>
              <Form
                form={boardForm}
                onSubmit={handleBoardSubmit}
                className="space-y-4"
              >
                <FormInput name="name" label="Board Name" required />
                <FormTextarea name="description" label="Description" />
                <FormSelect
                  name="folderId"
                  label="Folder"
                  options={[
                    { value: "1", label: "Marketing" },
                    { value: "2", label: "Personal" },
                    { value: "3", label: "Work Projects" },
                  ]}
                />
                <FormErrorSummary />
                <FormSubmit>Create Board</FormSubmit>
              </Form>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
