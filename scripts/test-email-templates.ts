import dotenv from 'dotenv';
import { sendTemplateEmail } from '../src/lib/email';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testEmailTemplates() {
  const testEmail = 'spunit2024@gmail.com';
  
  console.log('🧪 Testing email templates...\n');
  
  // Check if API key is loaded
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY not found in environment variables');
    console.log('📝 Make sure you have RESEND_API_KEY set in .env.local');
    return;
  }
  
  console.log('✅ Resend API key found, proceeding with tests...\n');

  try {
    // Test Welcome Email
    console.log('📧 Sending welcome email...');
    const welcomeResult = await sendTemplateEmail('welcome', {
      userEmail: testEmail,
    });
    
    if (welcomeResult.success) {
      console.log('✅ Welcome email sent successfully!');
    } else {
      console.error('❌ Welcome email failed:', welcomeResult.error);
    }

    // Test Payment Success Email
    console.log('\n📧 Sending payment success email...');
    const successResult = await sendTemplateEmail('payment-success', {
      userEmail: testEmail,
      planName: 'Pro Plan',
      amount: '$9.99',
      billingPeriod: 'monthly'
    });
    
    if (successResult.success) {
      console.log('✅ Payment success email sent successfully!');
    } else {
      console.error('❌ Payment success email failed:', successResult.error);
    }

    // Test Payment Failed Email
    console.log('\n📧 Sending payment failed email...');
    const failedResult = await sendTemplateEmail('payment-failed', {
      userEmail: testEmail,
      planName: 'Pro Plan',
      amount: '$9.99'
    });
    
    if (failedResult.success) {
      console.log('✅ Payment failed email sent successfully!');
    } else {
      console.error('❌ Payment failed email failed:', failedResult.error);
    }

    console.log('\n🎉 All email template tests completed!');
    console.log('📬 Check your inbox at spunit2024@gmail.com for the test emails.');

  } catch (error) {
    console.error('💥 Unexpected error during email testing:', error);
  }
}

// Run the test
testEmailTemplates();