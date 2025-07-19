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

interface WelcomeEmailProps {
  userEmail?: string;
}

export const WelcomeEmail = ({ userEmail = "user@example.com" }: WelcomeEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Narra - Start discovering amazing content!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>Narra</Text>
          </Section>
          
          <Section style={content}>
            <Text style={heading}>Welcome to Narra!</Text>
            
            <Text style={paragraph}>
              We're excited to have you on board. Narra helps you discover, organize, and save amazing social media content from TikTok and Instagram.
            </Text>
            
            <Text style={paragraph}>
              Here's what you can do:
            </Text>
            
            <Section style={features}>
              <Text style={feature}>✨ Discover trending content</Text>
              <Text style={feature}>📁 Organize posts in boards</Text>
              <Text style={feature}>👥 Follow your favorite creators</Text>
              <Text style={feature}>📱 Access from anywhere</Text>
            </Section>
            
            <Section style={buttonContainer}>
              <Button style={button} href="https://app.usenarra.com/dashboard">
                Start Exploring
              </Button>
            </Section>
            
            <Hr style={hr} />
            
            <Text style={footer}>
              Need help? Reply to this email or visit our help center.
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

const heading = {
  fontSize: "28px",
  fontWeight: "bold",
  color: "#1a1a1a",
  margin: "30px 0 20px",
  textAlign: "center" as const,
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#4a4a4a",
  margin: "16px 0",
};

const features = {
  margin: "24px 0",
  padding: "20px",
  backgroundColor: "#f8fafc",
  borderRadius: "8px",
};

const feature = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#4a4a4a",
  margin: "8px 0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#000000",
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

export default WelcomeEmail;