#!/usr/bin/env tsx
/**
 * Email Testing Script
 * 
 * This script helps test email functionality with the new welcome email template
 * 
 * Usage:
 * npm run test:email -- <email-address>
 * 
 * Example:
 * npm run test:email -- spunit2024@gmail.com
 */

import dotenv from 'dotenv';
import { resolve } from 'path';
import { sendTemplateEmail } from '../src/lib/email';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

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
  logSection('1. Checking Email Environment Variables');
  
  const requiredVars = [
    'RESEND_API_KEY'
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

async function sendTestWelcomeEmail(emailAddress: string) {
  logSection(`2. Sending Test Welcome Email to ${emailAddress}`);
  
  try {
    log('📧 Sending welcome email...', colors.blue);
    
    const result = await sendTemplateEmail('welcome', {
      userEmail: emailAddress
    });

    if (result.success) {
      log(`✅ Email sent successfully!`, colors.green);
      log(`📧 Email ID: ${result.data?.id}`, colors.green);
      log(`📬 Recipient: ${emailAddress}`, colors.green);
      log(`📝 Template: Welcome Email (Updated Design)`, colors.green);
    } else {
      log(`❌ Email sending failed:`, colors.red);
      console.error(result.error);
    }

    return result.success;
  } catch (error) {
    log(`❌ Error sending email: ${error}`, colors.red);
    return false;
  }
}

async function main() {
  // Get email address from command line arguments
  const emailAddress = process.argv[2];
  
  if (!emailAddress) {
    log('❌ Please provide an email address as an argument', colors.red);
    log('Usage: npm run test:email -- <email-address>', colors.yellow);
    log('Example: npm run test:email -- spunit2024@gmail.com', colors.yellow);
    process.exit(1);
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailAddress)) {
    log('❌ Invalid email address format', colors.red);
    process.exit(1);
  }

  log(`\n📧 Email Testing Script\n`, colors.cyan);
  log(`Target Email: ${emailAddress}`, colors.cyan);
  
  const envOk = await checkEnvironmentVariables();
  if (!envOk) {
    log('\n⚠️  Please set RESEND_API_KEY environment variable', colors.red);
    log('Get your API key from: https://resend.com/api-keys', colors.yellow);
    process.exit(1);
  }

  const emailSent = await sendTestWelcomeEmail(emailAddress);
  
  if (emailSent) {
    log('\n✅ Email test completed successfully!', colors.green);
    log('📧 Check your inbox (and spam folder) for the welcome email', colors.cyan);
  } else {
    log('\n❌ Email test failed', colors.red);
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  log(`\n❌ Script error: ${error}`, colors.red);
  process.exit(1);
});