#!/usr/bin/env tsx
/**
 * Cleanup Logo Image Script
 * 
 * This script removes the unused logo image from Supabase storage
 * since we're now using text-only logo for emails
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
  log('🧹 Cleaning up unused logo image from Supabase storage...', colors.blue);
  
  try {
    // Remove the SVG logo from storage
    const { error } = await supabase.storage
      .from('email-assets')
      .remove(['logo.svg']);

    if (error) {
      if (error.message.includes('not found')) {
        log('✅ Logo image already removed or not found', colors.green);
      } else {
        log(`❌ Error removing logo: ${error.message}`, colors.red);
      }
    } else {
      log('✅ Successfully removed logo.svg from storage', colors.green);
    }

    log('📝 Current email setup:', colors.cyan);
    log('  - Logo: "Narra" text (email-compatible)', colors.green);
    log('  - Hero image: ✅ PNG', colors.green);
    log('  - Feature icons: ✅ PNG', colors.green);
    log('  - Referral image: ✅ PNG', colors.green);
    
  } catch (error) {
    log(`❌ Script error: ${error}`, colors.red);
  }
}

main();