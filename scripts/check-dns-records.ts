import { execSync } from 'child_process';

function checkDNSRecord(domain: string, recordType: string) {
  try {
    const result = execSync(`dig ${recordType} ${domain} +short`, { encoding: 'utf8' });
    return result.trim();
  } catch (error) {
    return `Error: ${error}`;
  }
}

console.log('🔍 Checking DNS records for mail.usenarra.com...\n');

console.log('📧 SPF Record (TXT):');
const spf = checkDNSRecord('mail.usenarra.com', 'TXT');
console.log(spf || 'No SPF record found');

console.log('\n🔐 DKIM Record:');
const dkim = checkDNSRecord('resend._domainkey.mail.usenarra.com', 'TXT');
console.log(dkim || 'No DKIM record found');

console.log('\n📮 MX Record:');
const mx = checkDNSRecord('mail.usenarra.com', 'MX');
console.log(mx || 'No MX record found');

console.log('\n💡 To fix spam issues, make sure these DNS records exist:');
console.log('   SPF: "v=spf1 include:_spf.resend.com ~all"');
console.log('   DKIM: Available in your Resend domain settings');
console.log('   MX: feedback-smtp.us-east-1.amazonses.com (if using Resend)');