import { ColorTest } from "@/components/ui/color-test";

export default function TestColorsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container-narra section-spacing">
        <div className="content-spacing">
          <h1 className="text-foreground">Use Narra - Design System Test</h1>
          <ColorTest />
        </div>
      </div>
    </div>
  );
}
