"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormInput,
  FormTextarea,
  FormSelect,
  FormSubmit,
  useNarraForm,
  contactFormSchema,
  type ContactFormData,
} from "@/components/ui/form";
import { Input, PasswordInput, SearchInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ColorTestPage() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useNarraForm(contactFormSchema, {
    name: "",
    email: "",
    subject: "",
    message: "",
    priority: "medium",
  });

  const handleSubmit = async (data: ContactFormData) => {
    setIsLoading(true);
    console.log("Form submitted:", data);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    alert("Form submitted successfully!");
  };

  return (
    <div className="container-narra py-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Phase 4.4: Button & Input Variants
          </h1>
          <p className="text-lg text-muted-foreground">
            Testing comprehensive button and input component variants
          </p>
        </div>

        {/* Button Variants */}
        <section className="space-y-8">
          <h2 className="text-2xl font-semibold">Button Variants</h2>

          {/* Variant Types */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Color Variants</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="success">Success</Button>
                <Button variant="warning">Warning</Button>
                <Button variant="gradient">Gradient</Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Style Variants</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline">Outline</Button>
                <Button variant="outline-primary">Outline Primary</Button>
                <Button variant="outline-destructive">
                  Outline Destructive
                </Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="soft">Soft</Button>
                <Button variant="link">Link</Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Button Sizes</h3>
              <div className="flex items-center flex-wrap gap-3">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="xl">Extra Large</Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Icon Buttons</h3>
              <div className="flex items-center flex-wrap gap-3">
                <Button size="icon-sm" variant="outline">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </Button>
                <Button size="icon" variant="default">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </Button>
                <Button size="icon-lg" variant="secondary">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </Button>
                <Button size="icon-xl" variant="gradient">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Border Radius</h3>
              <div className="flex flex-wrap gap-3">
                <Button radius="none">None</Button>
                <Button radius="sm">Small</Button>
                <Button radius="default">Default</Button>
                <Button radius="lg">Large</Button>
                <Button radius="xl">Extra Large</Button>
                <Button radius="full">Full</Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">
                Loading & Disabled States
              </h3>
              <div className="flex flex-wrap gap-3">
                <Button loading>Loading</Button>
                <Button loading variant="outline">
                  Loading Outline
                </Button>
                <Button disabled>Disabled</Button>
                <Button disabled variant="destructive">
                  Disabled Destructive
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Input Variants */}
        <section className="space-y-8">
          <h2 className="text-2xl font-semibold">Input Variants</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Input Sizes */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Input Sizes</h3>
              <div className="space-y-3">
                <div>
                  <Label>Small Input</Label>
                  <Input size="sm" placeholder="Small input..." />
                </div>
                <div>
                  <Label>Default Input</Label>
                  <Input placeholder="Default input..." />
                </div>
                <div>
                  <Label>Large Input</Label>
                  <Input size="lg" placeholder="Large input..." />
                </div>
                <div>
                  <Label>Extra Large Input</Label>
                  <Input size="xl" placeholder="Extra large input..." />
                </div>
              </div>
            </div>

            {/* Input Variants */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Input States</h3>
              <div className="space-y-3">
                <div>
                  <Label>Default</Label>
                  <Input placeholder="Default state..." />
                </div>
                <div>
                  <Label>Success</Label>
                  <Input variant="success" placeholder="Success state..." />
                </div>
                <div>
                  <Label>Error</Label>
                  <Input variant="error" placeholder="Error state..." />
                </div>
                <div>
                  <Label>Warning</Label>
                  <Input variant="warning" placeholder="Warning state..." />
                </div>
              </div>
            </div>

            {/* Input with Icons */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Specialized Inputs</h3>
              <div className="space-y-3">
                <div>
                  <Label>Search Input</Label>
                  <SearchInput placeholder="Search anything..." />
                </div>
                <div>
                  <Label>Password Input</Label>
                  <PasswordInput placeholder="Enter password..." />
                </div>
                <div>
                  <Label>Input with Start Icon</Label>
                  <Input
                    placeholder="Email address..."
                    startIcon={
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                        />
                      </svg>
                    }
                  />
                </div>
                <div>
                  <Label>Input with End Icon</Label>
                  <Input
                    placeholder="Amount..."
                    endIcon={
                      <span className="text-sm text-muted-foreground">USD</span>
                    }
                  />
                </div>
              </div>
            </div>

            {/* Input Radius */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Border Radius</h3>
              <div className="space-y-3">
                <Input radius="none" placeholder="No radius..." />
                <Input radius="sm" placeholder="Small radius..." />
                <Input radius="lg" placeholder="Large radius..." />
                <Input radius="full" placeholder="Full radius..." />
              </div>
            </div>
          </div>
        </section>

        {/* Form Integration */}
        <section className="space-y-8">
          <h2 className="text-2xl font-semibold">Form Integration</h2>

          <div className="max-w-2xl">
            <Form form={form} onSubmit={handleSubmit} className="space-y-6">
              <FormInput
                name="name"
                label="Full Name"
                placeholder="Enter your full name"
                required
              />

              <FormInput
                name="email"
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                required
              />

              <FormSelect
                name="priority"
                label="Priority Level"
                required
                options={[
                  { value: "low", label: "Low Priority" },
                  { value: "medium", label: "Medium Priority" },
                  { value: "high", label: "High Priority" },
                  { value: "urgent", label: "Urgent" },
                ]}
              />

              <FormInput
                name="subject"
                label="Subject"
                placeholder="What's this about?"
              />

              <FormTextarea
                name="message"
                label="Message"
                placeholder="Tell us more details..."
                rows={4}
              />

              {/* Form Submit Variants */}
              <div className="flex flex-wrap gap-3 pt-4">
                <FormSubmit loading={isLoading} variant="default">
                  Submit Form
                </FormSubmit>
                <FormSubmit variant="outline" type="button">
                  Save Draft
                </FormSubmit>
                <Button variant="ghost" type="button">
                  Cancel
                </Button>
              </div>
            </Form>
          </div>
        </section>

        {/* Interactive Demo */}
        <section className="space-y-8">
          <h2 className="text-2xl font-semibold">Interactive Demo</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Button Playground</h3>
              <div className="space-y-4">
                <Button
                  variant="gradient"
                  size="lg"
                  radius="lg"
                  className="w-full"
                  onClick={() => alert("Button clicked!")}
                >
                  Click Me!
                </Button>
                <Button
                  variant="outline-primary"
                  size="lg"
                  radius="full"
                  className="w-full"
                  onClick={() => alert("Outline button clicked!")}
                >
                  Try This Too
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Input Playground</h3>
              <div className="space-y-4">
                <SearchInput
                  size="lg"
                  placeholder="Search with style..."
                  radius="lg"
                />
                <PasswordInput
                  size="lg"
                  placeholder="Secure password..."
                  radius="lg"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
