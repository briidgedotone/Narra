"use client";

import { Check } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export default function SelectPlanPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const plans = [
    {
      id: "inspiration",
      name: "Inspiration Plan",
      monthlyPrice: 24.99,
      yearlyPrice: 210,
      features: [
        "Access 1000+ Viral Posts",
        "Discover up to 100 Profiles/Month",
        "Follow 20 Profiles",
        "View 100 Video Transcripts/Month",
        "Unlimited Boards & Folders",
      ],
    },
    {
      id: "growth",
      name: "Growth Plan",
      monthlyPrice: 49.99,
      yearlyPrice: 419.99,
      features: [
        "Everything in Inspiration, plus:",
        "Discover up to 300 Profiles/Month",
        "Follow 50 Profiles",
        "View 300 Video Transcripts/Month",
        "365 Days Data Range",
      ],
    },
  ];

  const handleSelectPlan = async (planId: string) => {
    setSelectedPlan(planId);

    try {
      const response = await fetch("/api/stripe/checkout", {
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

      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        console.error("Failed to create checkout session");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

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
          <div className="bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-4 py-2 rounded-md transition-colors ${
                billingPeriod === "monthly"
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`px-4 py-2 rounded-md transition-colors ${
                billingPeriod === "yearly"
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Yearly (Save 30%)
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {plans.map(plan => (
            <div
              key={plan.id}
              className={`bg-white rounded-lg p-6 shadow-sm border-2 transition-all ${
                selectedPlan === plan.id
                  ? "border-blue-500 shadow-lg"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <h2 className="text-xl font-semibold mb-4">{plan.name}</h2>

              <div className="mb-6">
                <span className="text-3xl font-bold">
                  $
                  {billingPeriod === "monthly"
                    ? plan.monthlyPrice
                    : plan.yearlyPrice}
                </span>
                <span className="text-gray-500">
                  /{billingPeriod === "monthly" ? "month" : "year"}
                </span>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleSelectPlan(plan.id)}
                className="w-full"
                variant={selectedPlan === plan.id ? "default" : "outline"}
              >
                {selectedPlan === plan.id ? "Selected" : "Select Plan"}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
