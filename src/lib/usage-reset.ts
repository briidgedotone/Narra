import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Resets monthly usage counters for users whose reset date has passed
 * This should be called periodically (e.g., in middleware or a cron job)
 */
export async function resetMonthlyUsageCounters() {
  try {
    const now = new Date();

    // Update users whose usage_reset_date has passed
    const { data, error } = await supabase
      .from("users")
      .update({
        monthly_profile_discoveries: 0,
        monthly_transcripts_viewed: 0,
        usage_reset_date: new Date(now.getFullYear(), now.getMonth() + 1, 1), // First day of next month
        updated_at: now.toISOString(),
      })
      .lt("usage_reset_date", now.toISOString())
      .select("id");

    if (error) {
      console.error("Error resetting monthly usage counters:", error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      usersReset: data?.length || 0,
    };
  } catch (error) {
    console.error("Unexpected error in resetMonthlyUsageCounters:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Checks if a specific user's usage needs to be reset
 * and resets it if needed
 */
export async function checkAndResetUserUsage(userId: string) {
  try {
    const now = new Date();

    // Get user's current usage reset date
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("usage_reset_date")
      .eq("id", userId)
      .single();

    if (fetchError) {
      return { success: false, error: fetchError.message };
    }

    if (!user?.usage_reset_date) {
      return { success: true, resetNeeded: false };
    }

    const resetDate = new Date(user.usage_reset_date);

    // If reset date has passed, reset the user's usage
    if (resetDate <= now) {
      const { error: updateError } = await supabase
        .from("users")
        .update({
          monthly_profile_discoveries: 0,
          monthly_transcripts_viewed: 0,
          usage_reset_date: new Date(now.getFullYear(), now.getMonth() + 1, 1), // First day of next month
          updated_at: now.toISOString(),
        })
        .eq("id", userId);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      return { success: true, resetNeeded: true };
    }

    return { success: true, resetNeeded: false };
  } catch (error) {
    console.error("Unexpected error in checkAndResetUserUsage:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
