#!/usr/bin/env tsx
/**
 * Webhook Testing Script
 * 
 * This script helps test webhook integrations for Clerk and Stripe
 * 
 * Usage:
 * 1. First, set up environment variables in .env.local
 * 2. Run: npx tsx scripts/test-webhooks.ts
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

function logSection(title: string) {
  console.log(`\n${colors.blue}${'='.repeat(50)}${colors.reset}`);
  console.log(`${colors.blue}${title}${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(50)}${colors.reset}\n`);
}

async function checkEnvironmentVariables() {
  logSection('1. Checking Environment Variables');
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'CLERK_WEBHOOK_SECRET',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET'
  ];

  let allPresent = true;
  
  for (const varName of requiredVars) {
    if (process.env[varName]) {
      log(`✅ ${varName} is set`, colors.green);
    } else {
      log(`❌ ${varName} is missing`, colors.red);
      allPresent = false;
    }
  }

  return allPresent;
}

async function testDatabaseConnection() {
  logSection('2. Testing Database Connection');
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) throw error;
    
    log('✅ Database connection successful', colors.green);
    return true;
  } catch (error) {
    log(`❌ Database connection failed: ${error}`, colors.red);
    return false;
  }
}

async function checkWebhookTables() {
  logSection('3. Checking Webhook-Related Tables');
  
  const tables = ['users', 'subscriptions', 'webhook_events'];
  let allGood = true;

  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      
      log(`✅ Table '${table}' exists (${count || 0} records)`, colors.green);
    } catch (error) {
      log(`❌ Table '${table}' error: ${error}`, colors.red);
      allGood = false;
    }
  }

  return allGood;
}

async function checkRecentWebhookEvents() {
  logSection('4. Recent Webhook Events (Last 24 hours)');
  
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const { data: events, error } = await supabase
      .from('webhook_events')
      .select('*')
      .gte('created_at', yesterday.toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    if (events && events.length > 0) {
      log(`Found ${events.length} recent webhook events:`, colors.cyan);
      events.forEach(event => {
        log(`  - ${event.event_type} at ${new Date(event.created_at).toLocaleString()}`, colors.cyan);
      });
    } else {
      log('No webhook events in the last 24 hours', colors.yellow);
    }

    return true;
  } catch (error) {
    log(`❌ Failed to fetch webhook events: ${error}`, colors.red);
    return false;
  }
}

async function simulateClerkWebhook() {
  logSection('5. Testing Clerk Webhook Endpoint');
  
  log('To test Clerk webhook:', colors.yellow);
  log('1. Create a new account in your app', colors.yellow);
  log('2. Check the users table for the new record', colors.yellow);
  log('3. Or use Clerk Dashboard > Webhooks > Test', colors.yellow);
  
  // Check for recent user creations
  try {
    const fiveMinutesAgo = new Date();
    fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

    const { data: recentUsers, error } = await supabase
      .from('users')
      .select('*')
      .gte('created_at', fiveMinutesAgo.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (recentUsers && recentUsers.length > 0) {
      log(`\n✅ Found ${recentUsers.length} users created in last 5 minutes:`, colors.green);
      recentUsers.forEach(user => {
        log(`  - ${user.email} (${user.id})`, colors.green);
      });
    } else {
      log('\nNo users created in the last 5 minutes', colors.yellow);
    }
  } catch (error) {
    log(`\n❌ Failed to check recent users: ${error}`, colors.red);
  }
}

async function testStripeWebhook() {
  logSection('6. Testing Stripe Webhook Endpoint');
  
  log('To test Stripe webhooks:', colors.yellow);
  log('1. Install Stripe CLI: brew install stripe/stripe-cli/stripe', colors.yellow);
  log('2. Login: stripe login', colors.yellow);
  log('3. Forward webhooks: stripe listen --forward-to localhost:3000/api/stripe/webhook', colors.yellow);
  log('4. Trigger test events:', colors.yellow);
  log('   - stripe trigger checkout.session.completed', colors.cyan);
  log('   - stripe trigger invoice.payment_failed', colors.cyan);
  log('   - stripe trigger customer.subscription.updated', colors.cyan);
  
  // Check for recent subscriptions
  try {
    const { data: recentSubs, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;

    if (recentSubs && recentSubs.length > 0) {
      log(`\n✅ Found ${recentSubs.length} recent subscriptions:`, colors.green);
      recentSubs.forEach(sub => {
        log(`  - ${sub.stripe_subscription_id} (${sub.status})`, colors.green);
      });
    } else {
      log('\nNo subscriptions found', colors.yellow);
    }
  } catch (error) {
    log(`\n❌ Failed to check subscriptions: ${error}`, colors.red);
  }
}

async function checkCommonIssues() {
  logSection('7. Common Issues Check');
  
  // Check for duplicate webhook events
  try {
    const { data: duplicates, error } = await supabase
      .from('webhook_events')
      .select('stripe_event_id, count:stripe_event_id.count()')
      .select('stripe_event_id')
      .limit(1000);

    if (error) throw error;

    const eventCounts = new Map<string, number>();
    duplicates?.forEach(event => {
      const count = eventCounts.get(event.stripe_event_id) || 0;
      eventCounts.set(event.stripe_event_id, count + 1);
    });

    const duplicateEvents = Array.from(eventCounts.entries()).filter(([_, count]) => count > 1);
    
    if (duplicateEvents.length > 0) {
      log(`⚠️  Found ${duplicateEvents.length} duplicate webhook events`, colors.yellow);
    } else {
      log('✅ No duplicate webhook events found', colors.green);
    }
  } catch (error) {
    log(`❌ Failed to check for duplicates: ${error}`, colors.red);
  }

  // Check for orphaned subscriptions
  try {
    const { data: orphanedSubs, error } = await supabase
      .from('subscriptions')
      .select('user_id, stripe_subscription_id')
      .is('user_id', null);

    if (error) throw error;

    if (orphanedSubs && orphanedSubs.length > 0) {
      log(`⚠️  Found ${orphanedSubs.length} orphaned subscriptions`, colors.yellow);
    } else {
      log('✅ No orphaned subscriptions found', colors.green);
    }
  } catch (error) {
    log(`❌ Failed to check for orphaned subscriptions: ${error}`, colors.red);
  }
}

async function generateTestCommands() {
  logSection('8. Test Commands');
  
  log('Manual webhook testing commands:', colors.cyan);
  log('\n# Test Clerk webhook (create a test user):', colors.yellow);
  log(`curl -X POST http://localhost:3000/api/webhook/clerk \\
  -H "Content-Type: application/json" \\
  -H "svix-id: test_${Date.now()}" \\
  -H "svix-timestamp: ${Math.floor(Date.now() / 1000)}" \\
  -H "svix-signature: test_signature" \\
  -d '{"type": "user.created", "data": {"id": "test_user_${Date.now()}", "email_addresses": [{"email_address": "test@example.com"}]}}'`);

  log('\n# For proper Stripe testing, use Stripe CLI (recommended)', colors.yellow);
  log('# Or check the Stripe Dashboard > Developers > Webhooks > Test webhook', colors.yellow);
}

async function main() {
  log('\n🔍 Webhook Testing Script\n', colors.cyan);
  
  const envOk = await checkEnvironmentVariables();
  if (!envOk) {
    log('\n⚠️  Please set all required environment variables before continuing', colors.red);
    process.exit(1);
  }

  const dbOk = await testDatabaseConnection();
  if (!dbOk) {
    log('\n⚠️  Database connection failed. Check your Supabase credentials', colors.red);
    process.exit(1);
  }

  await checkWebhookTables();
  await checkRecentWebhookEvents();
  await simulateClerkWebhook();
  await testStripeWebhook();
  await checkCommonIssues();
  await generateTestCommands();

  log('\n✅ Webhook testing complete!\n', colors.green);
}

// Run the script
main().catch(error => {
  log(`\n❌ Script error: ${error}`, colors.red);
  process.exit(1);
});