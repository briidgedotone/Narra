import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_CONFIG, devLog } from "@/config";

export default function TestUIPage() {
  // Test development logging
  devLog("Test UI page loaded successfully!");

  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold">{APP_CONFIG.name} - UI Test</h1>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Test Card</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-input">Test Input</Label>
            <Input id="test-input" placeholder="Enter some text..." />
          </div>

          <div className="flex gap-2">
            <Button variant="default">Primary Button</Button>
            <Button variant="outline">Secondary Button</Button>
          </div>

          <Button variant="destructive" size="sm">
            Small Destructive Button
          </Button>
        </CardContent>
      </Card>

      <div className="text-sm text-muted-foreground">
        If you can see this styled content, ShadCN UI is working correctly!
      </div>
    </div>
  );
}
