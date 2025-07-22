import { render } from '@react-email/render';
import { WelcomeEmail } from '@/emails/welcome-email';

export default async function TestWelcomeEmailPage() {
  // Render the email template to HTML
  const emailHtml = await render(
    WelcomeEmail({ 
      userEmail: "test@example.com",
      baseUrl: "https://app.usenarra.com" 
    })
  );

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '20px', color: '#333' }}>Welcome Email Preview</h1>
        <p style={{ marginBottom: '20px', color: '#666' }}>
          This is how the welcome email will look when sent to users:
        </p>
        
        {/* Email preview container */}
        <div style={{ 
          border: '1px solid #ddd', 
          borderRadius: '8px', 
          overflow: 'hidden',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        }}>
          {/* Email subject preview */}
          <div style={{ 
            backgroundColor: '#333', 
            color: 'white', 
            padding: '15px 20px',
            fontFamily: 'monospace'
          }}>
            <strong>Subject:</strong> Welcome to Narra! 💌
          </div>
          
          {/* Email content */}
          <div 
            style={{ backgroundColor: 'white' }}
            dangerouslySetInnerHTML={{ __html: emailHtml }}
          />
        </div>
        
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
          <p style={{ margin: 0, color: '#1565c0' }}>
            <strong>Note:</strong> This is a temporary preview page. The actual email will be sent via Resend when users sign up.
          </p>
        </div>
      </div>
    </div>
  );
}