import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: Request,
  { params }: { params: { planId: string } }
) {
  try {
    const { planId } = params;

    const { data: plan, error } = await supabase
      .from("plans")
      .select("*")
      .eq("id", planId)
      .single();

    if (error || !plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: plan.id,
      name: plan.name,
      price_monthly: plan.price_monthly / 100, // Convert from cents
      price_yearly: plan.price_yearly / 100, // Convert from cents
      limits: plan.limits,
      features: plan.features,
    });
  } catch (error) {
    console.error("Plans API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch plan details" },
      { status: 500 }
    );
  }
}
