"use client";

import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { getUserSubscriptionStatus } from "@/app/actions/subscription";
import { Button } from "@/components/ui/button";

export default function SelectPlanPage() {
  const router = useRouter();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(true);

  const plans = [
    {
      id: "inspiration",
      name: "Inspiration Plan",
      monthlyPrice: 24.99,
      yearlyPrice: 210,
      features: [
        "Access 1000+ Viral Posts",
        "Discover up to 100 Profiles / Month",
        "Follow 20 Profiles for 24/7 Tracking",
        "Save Unlimited Videos",
        "Sort & View Top Performing Posts",
        "View up to 100 Video Transcripts / Month",
        "Unlimited Boards & Folders for Inspiration",
        "Public Shareable Board Links",
        "Profile & Post Analytics",
        "Data Range: Past 180 Days",
        "Cancel anytime",
        "24/7 dedicated support",
      ],
    },
    {
      id: "growth",
      name: "Growth Plan",
      monthlyPrice: 49.99,
      yearlyPrice: 419.99,
      features: [
        "Access 1000+ Viral Posts",
        "Discover up to 300 Profiles / Month",
        "Follow 50 Profiles for 24/7 Tracking",
        "Save Unlimited Videos",
        "Sort & View Top Performing Posts",
        "View up to 300 Video Transcripts / Month",
        "Unlimited Boards & Folders for Inspiration",
        "Public Shareable Board Links",
        "Profile & Post Analytics",
        "Data Range: Past 365 Days",
        "Cancel anytime",
        "24/7 dedicated support",
      ],
    },
    {
      id: "enterprise",
      name: "Enterprise Plan",
      monthlyPrice: "Custom",
      yearlyPrice: "Custom",
      features: [
        "Access 1000+ Viral Posts",
        "Profile Discovery: Custom",
        "Profile Follows: Custom",
        "Save Unlimited Videos",
        "Sort & View Top Performing Posts",
        "Video Transcripts: Custom",
        "Unlimited Boards & Folders for Inspiration",
        "Public Shareable Board Links",
        "Profile & Post Analytics",
        "Data Range: Past 365 Days",
        "Cancel anytime",
        "24/7 dedicated support",
      ],
    },
  ];

  // Check subscription status on page load
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      try {
        const result = await getUserSubscriptionStatus();

        if (result.success && result.data.hasActiveSubscription) {
          // User already has an active subscription, redirect to dashboard
          router.push("/dashboard");
          return;
        }
      } catch (error) {
        console.error("Error checking subscription status:", error);
        // On error, allow access to select-plan page
      } finally {
        setIsCheckingSubscription(false);
      }
    };

    checkSubscriptionStatus();
  }, [router]);

  const handleSelectPlan = async (planId: string) => {
    setLoadingPlan(planId);

    try {
      if (planId === "enterprise") {
        // Enterprise plan requires custom pricing - show contact message
        alert(
          "Enterprise plan requires custom pricing. Please contact us for a quote."
        );
        setLoadingPlan(null);
        return;
      }

      // Create Stripe checkout session
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId,
          billingPeriod,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      alert("Failed to start checkout process. Please try again.");
      setLoadingPlan(null);
    }
  };

  // Show loading state while checking subscription
  if (isCheckingSubscription) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking subscription status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-gray-600">
            Select a plan to start discovering viral content
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-full p-1 border border-gray-200">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-4 py-2 rounded-full transition-colors ${
                billingPeriod === "monthly"
                  ? "text-white"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              style={{
                backgroundColor:
                  billingPeriod === "monthly" ? "#3C82F6" : "transparent",
              }}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`px-4 py-2 rounded-full transition-colors ${
                billingPeriod === "yearly"
                  ? "text-white"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              style={{
                backgroundColor:
                  billingPeriod === "yearly" ? "#3C82F6" : "transparent",
              }}
            >
              Yearly (Save 30%)
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div
          className="flex flex-col lg:flex-row justify-center items-center"
          style={{ gap: "32px" }}
        >
          {plans.map(plan => (
            <div
              key={plan.id}
              className="transition-all flex-shrink-0 border-2 border-gray-200 relative overflow-hidden"
              style={{
                width: "459px",
                padding: "32px",
                minWidth: "459px",
                backgroundColor:
                  plan.id === "growth" ? "transparent" : "#ffffff",
                backgroundImage:
                  plan.id === "growth" ? "url(/growth-plan-bg.png)" : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                borderRadius: "16px",
                boxShadow:
                  plan.id === "growth"
                    ? "0 8px 32px rgba(0, 0, 0, 0.15)"
                    : "none",
                border: plan.id === "growth" ? "none" : undefined,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <h2
                  className="font-semibold"
                  style={{
                    fontSize: "24px",
                    color: plan.id === "growth" ? "#ffffff" : "#000000",
                  }}
                >
                  {plan.name}
                </h2>
                {plan.id === "growth" && (
                  <span
                    style={{
                      backgroundColor: "#ffffff",
                      color: "#3C82F6",
                      fontSize: "12px",
                      fontWeight: "600",
                      padding: "4px 12px",
                      borderRadius: "12px",
                    }}
                  >
                    Most Popular
                  </span>
                )}
              </div>
              <p
                style={{
                  fontSize: "18px",
                  color: plan.id === "growth" ? "#ffffff" : "#6b7280",
                }}
              >
                3-Day Free Trial
              </p>

              <div style={{ marginTop: "32px", marginBottom: "32px" }}>
                <span
                  style={{
                    fontSize: "36px",
                    color: plan.id === "growth" ? "#ffffff" : "#3b82f6",
                    fontWeight: "bold",
                  }}
                >
                  {typeof plan.monthlyPrice === "string" ? "" : "$"}
                  {billingPeriod === "monthly"
                    ? plan.monthlyPrice
                    : plan.yearlyPrice}
                </span>
                {typeof plan.monthlyPrice !== "string" && (
                  <span
                    style={{
                      color: plan.id === "growth" ? "#ffffff" : "#3b82f6",
                      fontSize: "36px",
                      fontWeight: "bold",
                    }}
                  >
                    /{billingPeriod === "monthly" ? "month" : "year"}
                  </span>
                )}
              </div>

              {/* Horizontal line separator */}
              <hr
                style={{
                  border: "none",
                  borderTop:
                    plan.id === "growth"
                      ? "1px solid #ffffff"
                      : "1px solid #e5e7eb",
                  margin: "32px 0",
                }}
              />

              <ul
                className="mb-6"
                style={{
                  gap: "12px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check
                      className={`h-5 w-5 mr-2 flex-shrink-0 mt-0.5 ${
                        plan.id === "growth" ? "text-white" : "text-green-500"
                      }`}
                    />
                    <span
                      style={{
                        fontSize: "16px",
                        color: plan.id === "growth" ? "#ffffff" : "#6b7280",
                      }}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Horizontal line separator */}
              <hr
                style={{
                  border: "none",
                  borderTop:
                    plan.id === "growth"
                      ? "1px solid #ffffff"
                      : "1px solid #e5e7eb",
                  margin: "32px 0",
                }}
              />

              <Button
                onClick={() => handleSelectPlan(plan.id)}
                className="w-full"
                disabled={loadingPlan === plan.id}
                style={{
                  backgroundColor: plan.id === "growth" ? "#ffffff" : "#000000",
                  color: plan.id === "growth" ? "#000000" : "#ffffff",
                  fontSize: "14px",
                  border: "none",
                  padding: "18px 24px",
                  cursor: "pointer",
                  opacity: loadingPlan === plan.id ? 0.7 : 1,
                }}
              >
                {loadingPlan === plan.id ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    Loading...
                  </div>
                ) : plan.id === "enterprise" ? (
                  "Contact Us"
                ) : (
                  "3-Day Free Trial"
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
