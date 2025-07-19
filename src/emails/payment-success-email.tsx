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

interface PaymentSuccessEmailProps {
  userEmail?: string;
  planName?: string;
  amount?: string;
  billingPeriod?: "monthly" | "yearly";
}

export const PaymentSuccessEmail = ({ 
  userEmail = "user@example.com",
  planName = "Pro Plan",
  amount = "$9.99",
  billingPeriod = "monthly"
}: PaymentSuccessEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Payment confirmed - Your {planName} is now active!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>Narra</Text>
          </Section>
          
          <Section style={content}>
            <Section style={successBadge}>
              <Text style={successIcon}>✅</Text>
            </Section>
            
            <Text style={heading}>Payment Confirmed!</Text>
            
            <Text style={paragraph}>
              Thank you for subscribing to {planName}! Your account has been activated and you can now access all premium features.
            </Text>
            
            <Section style={receiptBox}>
              <Text style={receiptHeading}>Payment Details</Text>
              <Section style={receiptItem}>
                <Text style={receiptLabel}>Plan:</Text>
                <Text style={receiptValue}>{planName}</Text>
              </Section>
              <Section style={receiptItem}>
                <Text style={receiptLabel}>Amount:</Text>
                <Text style={receiptValue}>{amount}</Text>
              </Section>
              <Section style={receiptItem}>
                <Text style={receiptLabel}>Billing:</Text>
                <Text style={receiptValue}>{billingPeriod === "yearly" ? "Yearly" : "Monthly"}</Text>
              </Section>
            </Section>
            
            <Text style={paragraph}>
              Your premium account includes unlimited boards, advanced search capabilities, and priority customer support.
            </Text>
            
            <Section style={buttonContainer}>
              <Button style={button} href="https://app.usenarra.com/dashboard">
                Start Using Your Plan
              </Button>
            </Section>
            
            <Hr style={hr} />
            
            <Text style={footer}>
              Questions about your subscription? Reply to this email or visit your billing settings.
            </Text>
            
            <Text style={unsubscribe}>
              This email was sent to {userEmail} regarding your Narra account. 
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

const successBadge = {
  textAlign: "center" as const,
  margin: "20px 0",
};

const successIcon = {
  fontSize: "48px",
  margin: "0",
};

const heading = {
  fontSize: "28px",
  fontWeight: "bold",
  color: "#1a1a1a",
  margin: "20px 0",
  textAlign: "center" as const,
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#4a4a4a",
  margin: "16px 0",
};

const receiptBox = {
  backgroundColor: "#f8fafc",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
  border: "1px solid #e6ebf1",
};

const receiptHeading = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#1a1a1a",
  margin: "0 0 16px 0",
};

const receiptItem = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  margin: "12px 0",
};

const receiptLabel = {
  fontSize: "16px",
  color: "#4a4a4a",
  margin: "0",
  width: "50%",
};

const receiptValue = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#1a1a1a",
  margin: "0",
  textAlign: "right" as const,
  width: "50%",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#22c55e",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
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

export default PaymentSuccessEmail;