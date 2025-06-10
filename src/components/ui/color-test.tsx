import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

export function ColorTest() {
  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Use Narra Design System Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
    </div>
  );
}
