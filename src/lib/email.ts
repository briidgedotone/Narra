import { Resend } from 'resend';
import { render } from '@react-email/render';
import WelcomeEmail from '@/emails/welcome-email';

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
export type EmailTemplate = 'welcome';

// Template-specific props
interface WelcomeEmailData {
  userEmail: string;
}

// Enhanced email sending function with React templates
export async function sendTemplateEmail(
  template: 'welcome',
  data: WelcomeEmailData
): Promise<{ success: boolean; data?: any; error?: any }>;

export async function sendTemplateEmail(
  template: EmailTemplate,
  data: WelcomeEmailData
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

      default:
        throw new Error(`Unknown email template: ${template}`);
    }

    // Send the email
    const resendClient = getResendClient();
    
    let emailResult = await resendClient.emails.send({
      from: 'Narra <noreply@mail.usenarra.com>',
      to: data.userEmail,
      subject,
      html,
    });

    // If first attempt fails with domain/verification error, try with default sender
    if (emailResult.error && (emailResult.error as any).statusCode === 403) {
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