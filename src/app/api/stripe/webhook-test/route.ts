import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  console.log("🧪 [Webhook Test] GET request received");
  return NextResponse.json({
    message: "Webhook endpoint is reachable",
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: NextRequest) {
  console.log("🧪 [Webhook Test] POST request received");

  try {
    const headers = Object.fromEntries(req.headers.entries());
    const body = await req.text();

    console.log("🧪 [Webhook Test] Headers:", headers);
    console.log("🧪 [Webhook Test] Body length:", body.length);
    console.log(
      "🧪 [Webhook Test] Has stripe-signature:",
      !!headers["stripe-signature"]
    );

    return NextResponse.json({
      received: true,
      timestamp: new Date().toISOString(),
      hasSignature: !!headers["stripe-signature"],
      bodyLength: body.length,
    });
  } catch (error) {
    console.error("🧪 [Webhook Test] Error:", error);
    return NextResponse.json({ error: "Test webhook failed" }, { status: 500 });
  }
}
