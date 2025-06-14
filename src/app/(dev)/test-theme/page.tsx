"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTheme } from "@/components/ui/theme-provider";

export default function TestThemePage() {
  const { theme } = useTheme();
  const [isDark, setIsDark] = useState(false);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Use Narra Theme System</h1>
        <p className="text-muted-foreground">
          Testing the custom theme with sidebar styling
        </p>
        <Button onClick={toggleDarkMode} className="mt-4">
          Toggle {isDark ? "Light" : "Dark"} Mode
        </Button>
      </div>

      {/* Theme Colors */}
      <Card>
        <CardHeader>
          <CardTitle>Brand Colors</CardTitle>
          <CardDescription>Primary brand color palette</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div
                className="w-full h-20 rounded-lg mb-2"
                style={{ backgroundColor: theme.brand.primary }}
              />
              <p className="text-sm font-medium">Primary</p>
              <p className="text-xs text-muted-foreground">
                {theme.brand.primary}
              </p>
            </div>
            <div className="text-center">
              <div
                className="w-full h-20 rounded-lg mb-2"
                style={{ backgroundColor: theme.brand.secondary }}
              />
              <p className="text-sm font-medium">Secondary</p>
              <p className="text-xs text-muted-foreground">
                {theme.brand.secondary}
              </p>
            </div>
            <div className="text-center">
              <div
                className="w-full h-20 rounded-lg mb-2"
                style={{ backgroundColor: theme.brand.accent }}
              />
              <p className="text-sm font-medium">Accent</p>
              <p className="text-xs text-muted-foreground">
                {theme.brand.accent}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sidebar Colors */}
      <Card>
        <CardHeader>
          <CardTitle>Sidebar Theme</CardTitle>
          <CardDescription>
            Custom sidebar styling with {theme.sidebar.width} width
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Colors</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: theme.sidebar.background }}
                  />
                  <span className="text-sm">
                    Background: {theme.sidebar.background}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: theme.sidebar.border }}
                  />
                  <span className="text-sm">
                    Border: {theme.sidebar.border}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: theme.sidebar.hover.background }}
                  />
                  <span className="text-sm">
                    Hover: {theme.sidebar.hover.background}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: theme.sidebar.active.background }}
                  />
                  <span className="text-sm">
                    Active: {theme.sidebar.active.background}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">Specifications</h4>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Width:</strong> {theme.sidebar.width}
                </p>
                <p>
                  <strong>Text Primary:</strong> {theme.sidebar.text.primary}
                </p>
                <p>
                  <strong>Text Secondary:</strong>{" "}
                  {theme.sidebar.text.secondary}
                </p>
                <p>
                  <strong>Text Active:</strong> {theme.sidebar.text.active}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Component Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Component Examples</CardTitle>
          <CardDescription>Components using the theme system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button variant="default">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="outline">Outline Button</Button>
          </div>

          {/* Mini Sidebar Preview */}
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-3">Sidebar Preview</h4>
            <div
              className="sidebar-narra rounded-lg overflow-hidden"
              style={{ width: "200px", height: "300px" }}
            >
              <div className="p-4 border-b border-[var(--sidebar-border-color)]">
                <h3 className="sidebar-brand text-sm font-semibold">
                  Use Narra
                </h3>
              </div>
              <div className="p-2 space-y-1">
                <div className="sidebar-nav-item active flex items-center px-2 py-2 rounded text-sm">
                  <div className="w-4 h-4 bg-current rounded mr-2 opacity-70" />
                  Dashboard
                </div>
                <div className="sidebar-nav-item flex items-center px-2 py-2 rounded text-sm">
                  <div className="w-4 h-4 bg-current rounded mr-2 opacity-70" />
                  Discovery
                </div>
                <div className="sidebar-nav-item flex items-center px-2 py-2 rounded text-sm">
                  <div className="w-4 h-4 bg-current rounded mr-2 opacity-70" />
                  Following
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CSS Variables */}
      <Card>
        <CardHeader>
          <CardTitle>CSS Variables</CardTitle>
          <CardDescription>
            Available CSS custom properties for the theme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono">
            <div>
              <h4 className="font-sans font-medium mb-2">Sidebar Variables</h4>
              <div className="space-y-1 text-xs">
                <p>--sidebar-width</p>
                <p>--sidebar-bg</p>
                <p>--sidebar-border-color</p>
                <p>--sidebar-text-primary</p>
                <p>--sidebar-text-secondary</p>
                <p>--sidebar-hover-bg</p>
                <p>--sidebar-active-bg</p>
                <p>--sidebar-active-text</p>
              </div>
            </div>
            <div>
              <h4 className="font-sans font-medium mb-2">Brand Variables</h4>
              <div className="space-y-1 text-xs">
                <p>--brand-primary</p>
                <p>--brand-secondary</p>
                <p>--brand-accent</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
