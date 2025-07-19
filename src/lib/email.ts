import { Resend } from 'resend';
import { render } from '@react-email/render';
import WelcomeEmail from '@/emails/welcome-email';
import PaymentSuccessEmail from '@/emails/payment-success-email';
import PaymentFailedEmail from '@/emails/payment-failed-email';

// Initialize Resend client (lazy loading)
let resend: Resend | null = null;

function getResendClient() {
  if (!resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is required');
    }
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

// Email template types
export type EmailTemplate = 'welcome' | 'payment-success' | 'payment-failed';

// Template-specific props
interface WelcomeEmailData {
  userEmail: string;
}

interface PaymentSuccessEmailData {
  userEmail: string;
  planName: string;
  amount?: string;
  billingPeriod?: 'monthly' | 'yearly';
}

interface PaymentFailedEmailData {
  userEmail: string;
  planName: string;
  amount?: string;
}

// Enhanced email sending function with React templates
export async function sendTemplateEmail(
  template: 'welcome',
  data: WelcomeEmailData
): Promise<{ success: boolean; data?: any; error?: any }>;

export async function sendTemplateEmail(
  template: 'payment-success',
  data: PaymentSuccessEmailData
): Promise<{ success: boolean; data?: any; error?: any }>;

export async function sendTemplateEmail(
  template: 'payment-failed',
  data: PaymentFailedEmailData
): Promise<{ success: boolean; data?: any; error?: any }>;

export async function sendTemplateEmail(
  template: EmailTemplate,
  data: WelcomeEmailData | PaymentSuccessEmailData | PaymentFailedEmailData
) {
  try {
    let html: string;
    let subject: string;

    // Render the appropriate template
    switch (template) {
      case 'welcome':
        const welcomeData = data as WelcomeEmailData;
        html = await render(WelcomeEmail({ userEmail: welcomeData.userEmail }));
        subject = 'Welcome to Narra!';
        break;

      case 'payment-success':
        const successData = data as PaymentSuccessEmailData;
        const successProps: any = {
          userEmail: successData.userEmail,
          planName: successData.planName,
        };
        if (successData.amount) successProps.amount = successData.amount;
        if (successData.billingPeriod) successProps.billingPeriod = successData.billingPeriod;
        
        html = await render(PaymentSuccessEmail(successProps));
        subject = 'Payment Confirmed - Welcome to Your Plan!';
        break;

      case 'payment-failed':
        const failedData = data as PaymentFailedEmailData;
        const failedProps: any = {
          userEmail: failedData.userEmail,
          planName: failedData.planName,
        };
        if (failedData.amount) failedProps.amount = failedData.amount;
        
        html = await render(PaymentFailedEmail(failedProps));
        subject = 'Payment Failed - Action Required';
        break;

      default:
        throw new Error(`Unknown email template: ${template}`);
    }

    // Send the email
    console.log(`Sending ${template} email to: ${data.userEmail}, subject: ${subject}`);
    const resendClient = getResendClient();
    
    let emailResult = await resendClient.emails.send({
      from: 'Narra <noreply@mail.usenarra.com>',
      to: data.userEmail,
      subject,
      html,
    });

    // If first attempt fails with domain/verification error, try with default sender
    if (emailResult.error && emailResult.error.statusCode === 403) {
      console.log('Domain verification issue, trying with default sender...');
      emailResult = await resendClient.emails.send({
        from: 'onboarding@resend.dev',
        to: data.userEmail,
        subject: `[Narra] ${subject}`,
        html,
      });
    }

    if (emailResult.error) {
      console.error('Email sending failed:', emailResult.error);
      return { success: false, error: emailResult.error };
    }

    console.log('Email sent successfully:', emailResult.data?.id);
    return { success: true, data: emailResult.data };
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false, error };
  }
}

// Legacy function for backward compatibility
export async function sendEmail({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}) {
  try {
    const resendClient = getResendClient();
    const { data, error } = await resendClient.emails.send({
      from: 'Narra <noreply@mail.usenarra.com>',
      to,
      subject,
      text,
    });

    if (error) {
      console.error('Email sending failed:', error);
      return { success: false, error };
    }

    console.log('Email sent successfully:', data?.id);
    return { success: true, data };
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false, error };
  }
}