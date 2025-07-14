"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Loader2, Check, AlertCircle } from "@/components/ui/icons";

interface PaymentSuccessHandlerProps {
  sessionId: string;
  children: React.ReactNode;
}

export function PaymentSuccessHandler({
  sessionId,
  children,
}: PaymentSuccessHandlerProps) {
  const { user } = useUser();
  const router = useRouter();
  const [status, setStatus] = useState<
    "verifying" | "success" | "timeout" | "error"
  >("verifying");
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 10; // Max 30 seconds (3s * 10)
  const retryDelay = 3000; // 3 seconds

  useEffect(() => {
    if (!user || !sessionId) return;

    const verifyPayment = async () => {
      try {
        const response = await fetch(`/api/stripe/verify-session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });

        const data = await response.json();

        if (data.success && data.planId) {
          setStatus("success");
          // Remove session_id from URL after successful verification
          const url = new URL(window.location.href);
          url.searchParams.delete("session_id");
          router.replace(url.pathname + url.search);
          return;
        }

        // If not successful and we haven't exceeded max retries, try again
        if (retryCount < maxRetries) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, retryDelay);
        } else {
          setStatus("timeout");
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        if (retryCount < maxRetries) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, retryDelay);
        } else {
          setStatus("error");
        }
      }
    };

    verifyPayment();
  }, [user, sessionId, retryCount, router]);

  if (status === "verifying") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Processing your payment...
            </h2>
            <p className="text-gray-600 mt-2">
              This may take a few moments. Please don&apos;t close this page.
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Attempt {retryCount + 1} of {maxRetries + 1}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="mb-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <Check className="h-5 w-5 text-green-600" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Payment successful!
              </h3>
              <p className="text-sm text-green-700 mt-1">
                Your subscription has been activated. Welcome to Narra!
              </p>
            </div>
          </div>
        </div>
        {children}
      </div>
    );
  }

  if (status === "timeout" || status === "error") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="h-8 w-8 text-amber-600 mx-auto" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Payment verification taking longer than expected
            </h2>
            <p className="text-gray-600 mt-2">
              Your payment was likely successful, but it&apos;s taking longer to
              process than usual. You can continue using the dashboard, and your
              subscription will be activated shortly.
            </p>
            <button
              onClick={() => {
                // Add payment_bypass parameter to allow dashboard access temporarily
                const url = new URL(window.location.href);
                url.searchParams.delete("session_id");
                url.searchParams.set("payment_bypass", "true");
                router.replace(url.pathname + url.search);
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
