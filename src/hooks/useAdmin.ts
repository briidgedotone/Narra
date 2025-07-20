"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";

import { checkCurrentUserAdmin } from "@/app/actions/check-admin";

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
        const result = await checkCurrentUserAdmin();
        if (result.success) {
          setIsAdmin(result.isAdmin);
        } else {
          console.error("Error checking admin status:", result.error);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkAdminStatus();
  }, [user?.id]);

  return { isAdmin, isLoading };
}
