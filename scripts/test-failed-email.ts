#!/usr/bin/env tsx
/**
 * Test Payment Failed Email with Cross Icon
 */

import { Resend } from 'resend';
import { PaymentFailedEmail } from '@/emails/payment-failed-email';
import { resolve } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY!);

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
  const testEmail = 'spunit2024@gmail.com';
  
  log('🧪 Testing payment failed email with cross icon...', colors.blue);
  
  try {
    // Test Payment Failed Email
    log('\n📧 Sending payment failed email...', colors.cyan);
    const failedResult = await resend.emails.send({
      from: 'Narra <billing@mail.usenarra.com>',
      to: testEmail,
      subject: 'Payment Failed - Action Required ⚠️',
      react: PaymentFailedEmail({
        userEmail: testEmail,
        planName: 'Pro Plan',
        amount: '$19.99'
      }),
    });

    if (failedResult.error) {
      log(`❌ Payment failed email failed: ${failedResult.error.message}`, colors.red);
    } else {
      log(`✅ Payment failed email sent successfully!`, colors.green);
      log(`   Email ID: ${failedResult.data?.id}`, colors.green);
    }

    log('\n🎨 Updated email features:', colors.cyan);
    log('  ❌ Cross icon (80x80px) instead of ⚠️ emoji', colors.red);
    log('  ✅ Welcome email styling and layout', colors.green);
    log('  ✅ Red urgent notice section', colors.green);
    log('  ✅ Purple "Need Help?" section', colors.green);
    log('  ✅ Transparent icon background', colors.green);
    
  } catch (error) {
    log(`❌ Script error: ${error}`, colors.red);
  }
}

main();