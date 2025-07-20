#!/usr/bin/env tsx
/**
 * Cleanup Referral Image Script
 * 
 * This script removes the unused referral image from Supabase storage
 * since we changed the section to "Get Started" without image
 */

import { createClient } from '@supabase/supabase-js';
import { resolve } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function main() {
  log('🧹 Cleaning up unused referral image from Supabase storage...', colors.blue);
  
  try {
    // Remove the referral image from storage
    const { error } = await supabase.storage
      .from('email-assets')
      .remove(['referral.png']);

    if (error) {
      if (error.message.includes('not found')) {
        log('✅ Referral image already removed or not found', colors.green);
      } else {
        log(`❌ Error removing referral image: ${error.message}`, colors.red);
      }
    } else {
      log('✅ Successfully removed referral.png from storage', colors.green);
    }

    log('📝 Updated email setup:', colors.cyan);
    log('  - Logo: "Narra" text (email-compatible)', colors.green);
    log('  - Hero image: ✅ PNG', colors.green);
    log('  - Feature icons: ✅ 3 PNG images', colors.green);
    log('  - Get Started section: ✅ Text-only (no image)', colors.green);
    
  } catch (error) {
    log(`❌ Script error: ${error}`, colors.red);
  }
}

main();