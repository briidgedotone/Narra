import dotenv from 'dotenv';
import { Resend } from 'resend';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function debugEmailDelivery() {
  console.log('🔍 Debugging email delivery...\n');
  
  const resend = new Resend(process.env.RESEND_API_KEY);
  const testEmail = 'tejash.narwana001@gmail.com';
  
  try {
    // Test 1: Simple text email
    console.log('📧 Test 1: Sending simple text email...');
    const result1 = await resend.emails.send({
      from: 'Narra <noreply@mail.usenarra.com>',
      to: testEmail,
      subject: 'Test Email - Simple Text',
      text: 'This is a simple test email to verify delivery.',
    });
    console.log('Result 1:', result1);
    
    // Test 2: Different sender email
    console.log('\n📧 Test 2: Sending with onboarding@resend.dev...');
    const result2 = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: testEmail,
      subject: 'Test Email - Resend Default',
      text: 'This is a test email using the default Resend sender.',
    });
    console.log('Result 2:', result2);
    
    // Test 3: Check domain verification status
    console.log('\n🔍 Test 3: Checking domain verification...');
    const domains = await resend.domains.list();
    console.log('Domains:', JSON.stringify(domains, null, 2));
    
    console.log('\n✅ Email debugging complete!');
    console.log('📝 Check:');
    console.log('   1. Spam/junk folders');
    console.log('   2. Email address spelling');
    console.log('   3. Domain verification in Resend dashboard');
    
  } catch (error) {
    console.error('❌ Error during email debugging:', error);
  }
}

debugEmailDelivery();