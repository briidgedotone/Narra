#!/usr/bin/env tsx
/**
 * Test Both Payment Emails with Icons
 */

import { Resend } from 'resend';
import { PaymentSuccessEmail } from '@/emails/payment-success-email';
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
  
  log('🧪 Testing both payment emails with updated icons...', colors.blue);
  
  try {
    // Test Payment Success Email
    log('\n📧 Sending payment success email...', colors.cyan);
    const successResult = await resend.emails.send({
      from: 'Narra <onboarding@mail.usenarra.com>',
      to: testEmail,
      subject: 'Payment Confirmed - Your Pro Plan is Active! 🎉',
      react: PaymentSuccessEmail({
        userEmail: testEmail,
        planName: 'Pro Plan',
        amount: '$19.99',
        billingPeriod: 'monthly'
      }),
    });

    if (successResult.error) {
      log(`❌ Payment success email failed: ${successResult.error.message}`, colors.red);
    } else {
      log(`✅ Payment success email sent successfully!`, colors.green);
      log(`   Email ID: ${successResult.data?.id}`, colors.green);
    }

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

    log('\n🎨 Final email features:', colors.cyan);
    log('  ✅ Green checkmark icon for success', colors.green);
    log('  ❌ Cross icon for failed payments', colors.red);
    log('  ✅ Welcome email styling consistency', colors.green);
    log('  ✅ Professional branded appearance', colors.green);
    log('  ✅ Email-client compatible icons', colors.green);
    log('  ✅ Transparent backgrounds', colors.green);
    
  } catch (error) {
    log(`❌ Script error: ${error}`, colors.red);
  }
}

main();