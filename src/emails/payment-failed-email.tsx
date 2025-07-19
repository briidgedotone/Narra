import React from "react";
import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Button,
  Hr,
} from "@react-email/components";

interface PaymentFailedEmailProps {
  userEmail?: string;
  planName?: string;
  amount?: string;
}

export const PaymentFailedEmail = ({ 
  userEmail = "user@example.com",
  planName = "Pro Plan",
  amount = "$9.99"
}: PaymentFailedEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Payment failed - Update your payment method</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>Narra</Text>
          </Section>
          
          <Section style={content}>
            <Section style={alertBadge}>
              <Text style={alertIcon}>⚠️</Text>
            </Section>
            
            <Text style={heading}>Payment Failed</Text>
            
            <Text style={paragraph}>
              We were unable to process your payment for your <strong>{planName}</strong> subscription. Your account is currently past due.
            </Text>
            
            <Section style={detailsBox}>
              <Text style={detailsHeading}>Payment Details</Text>
              <Section style={detailsItem}>
                <Text style={detailsLabel}>Plan:</Text>
                <Text style={detailsValue}>{planName}</Text>
              </Section>
              <Section style={detailsItem}>
                <Text style={detailsLabel}>Amount:</Text>
                <Text style={detailsValue}>{amount}</Text>
              </Section>
              <Section style={detailsItem}>
                <Text style={detailsLabel}>Status:</Text>
                <Text style={detailsStatus}>Past Due</Text>
              </Section>
            </Section>
            
            <Text style={paragraph}>
              To continue using your Narra subscription and avoid service interruption, please update your payment method or retry the payment.
            </Text>
            
            <Section style={actionsContainer}>
              <Button style={primaryButton} href="https://app.usenarra.com/billing">
                Update Payment Method
              </Button>
              
              <Button style={secondaryButton} href="https://app.usenarra.com/support">
                Contact Support
              </Button>
            </Section>
            
            <Text style={urgentText}>
              Your subscription will be cancelled automatically if payment is not received within 7 days.
            </Text>
            
            <Hr style={hr} />
            
            <Text style={footer}>
              Having trouble? Our support team is here to help. Reply to this email or visit our help center.
            </Text>
            
            <Text style={unsubscribe}>
              This email was sent to {userEmail} regarding your Narra subscription. 
              If you need assistance, contact us at support@usenarra.com
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
};

const header = {
  padding: "20px 30px",
  textAlign: "center" as const,
};

const logo = {
  fontSize: "32px",
  fontWeight: "bold",
  color: "#1a1a1a",
  margin: "0",
};

const content = {
  padding: "0 30px",
};

const alertBadge = {
  textAlign: "center" as const,
  margin: "20px 0",
};

const alertIcon = {
  fontSize: "48px",
  margin: "0",
};

const heading = {
  fontSize: "28px",
  fontWeight: "bold",
  color: "#dc2626",
  margin: "20px 0",
  textAlign: "center" as const,
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#4a4a4a",
  margin: "16px 0",
};

const detailsBox = {
  backgroundColor: "#fef2f2",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
  border: "1px solid #fecaca",
};

const detailsHeading = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#1a1a1a",
  margin: "0 0 16px 0",
};

const detailsItem = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  margin: "12px 0",
};

const detailsLabel = {
  fontSize: "16px",
  color: "#4a4a4a",
  margin: "0",
  width: "50%",
};

const detailsValue = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#1a1a1a",
  margin: "0",
  textAlign: "right" as const,
  width: "50%",
};

const detailsStatus = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#dc2626",
  margin: "0",
  textAlign: "right" as const,
  width: "50%",
};

const actionsContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const primaryButton = {
  backgroundColor: "#dc2626",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
  margin: "8px 8px",
};

const secondaryButton = {
  backgroundColor: "transparent",
  borderRadius: "8px",
  color: "#374151",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
  margin: "8px 8px",
  border: "2px solid #d1d5db",
};

const urgentText = {
  fontSize: "14px",
  lineHeight: "1.6",
  color: "#dc2626",
  margin: "24px 0",
  textAlign: "center" as const,
  fontWeight: "600",
  backgroundColor: "#fef2f2",
  padding: "12px",
  borderRadius: "6px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "32px 0",
};

const footer = {
  fontSize: "14px",
  color: "#8898aa",
  textAlign: "center" as const,
  margin: "32px 0 0",
};

const unsubscribe = {
  fontSize: "12px",
  color: "#8898aa",
  textAlign: "center" as const,
  margin: "16px 0 0",
  lineHeight: "1.4",
};

export default PaymentFailedEmail;