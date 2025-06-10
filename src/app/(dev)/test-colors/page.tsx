import { ColorTest } from "@/components/ui/color-test";

export default function TestColorsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <h1 className="text-foreground mb-8">Use Narra - Design System Test</h1>
        <ColorTest />
      </div>
    </div>
  );
}
