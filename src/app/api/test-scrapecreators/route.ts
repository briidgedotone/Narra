import { NextResponse } from "next/server";

import { scrapeCreatorsApi } from "@/lib/api";

export async function GET() {
  try {
    const result = await scrapeCreatorsApi.testConnection();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "ScrapeCreators API is working",
        data: result.data,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "ScrapeCreators API connection failed",
          error: result.error,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to test ScrapeCreators API",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
