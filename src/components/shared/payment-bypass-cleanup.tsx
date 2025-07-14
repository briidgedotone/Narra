"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export function PaymentBypassCleanup(): null {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const paymentBypass = searchParams.get("payment_bypass");

    if (paymentBypass === "true") {
      // Clean up the payment_bypass parameter after 30 seconds
      const timer = setTimeout(() => {
        const url = new URL(window.location.href);
        url.searchParams.delete("payment_bypass");

        // Only replace URL if we're still on the same path
        if (window.location.pathname === url.pathname) {
          router.replace(url.pathname + url.search, { scroll: false });
        }
      }, 30000); // 30 seconds

      return () => clearTimeout(timer);
    }

    return undefined;
  }, [searchParams, router]);

  return null; // This component doesn't render anything
}
