"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";

/**
 * Hook to check if current user is admin
 * @returns {isAdmin: boolean, isLoading: boolean}
 */
export function useAdmin() {
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAdminStatus() {
      if (!user?.id) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        console.log(`🔍 [useAdmin] Checking admin status for user ${user.id}`);
        const response = await fetch("/api/auth/admin-status");
        const data = await response.json();
        console.log(`📊 [useAdmin] Admin status response:`, data);
        setIsAdmin(data.isAdmin || false);
      } catch (error) {
        console.error("❌ [useAdmin] Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkAdminStatus();
  }, [user?.id]);

  return { isAdmin, isLoading };
}
