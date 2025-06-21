import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.SCRAPECREATORS_API_KEY;
    
    return NextResponse.json({
      hasApiKey: !!apiKey,
      keyLength: apiKey ? apiKey.length : 0,
      keyPrefix: apiKey ? `${apiKey.substring(0, 8)}...` : "Not set",
      nodeEnv: process.env.NODE_ENV,
      message: apiKey 
        ? "API key is configured" 
        : "API key is missing - add SCRAPECREATORS_API_KEY to your .env.local file"
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        hasApiKey: false
      },
      { status: 500 }
    );
  }
} 