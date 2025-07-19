import dotenv from 'dotenv';
import { sendTemplateEmail } from '../src/lib/email';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testProductionEmail() {
  console.log('🧪 Testing production email template...\n');
  
  try {
    // Test sending to the actual user email that had issues
    const testEmail = 'tejash.narwana001@gmail.com';
    
    console.log('📧 Sending payment success email...');
    const result = await sendTemplateEmail('payment-success', {
      userEmail: testEmail,
      planName: 'Pro Plan',
      amount: '$9.99',
      billingPeriod: 'monthly'
    });
    
    console.log('📊 Full result:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ Email sent successfully!');
      console.log('📬 Check inbox at:', testEmail);
    } else {
      console.log('❌ Email failed to send');
      console.log('💡 Error details:', result.error);
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

testProductionEmail();