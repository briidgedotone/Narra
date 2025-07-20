import React from "react";
import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Button,
  Row,
  Column,
} from "@react-email/components";
import { EMAIL_LOGO, EMAIL_IMAGES } from "@/config/email-images";

interface PaymentSuccessEmailProps {
  userEmail?: string;
  planName?: string;
  amount?: string;
  billingPeriod?: "monthly" | "yearly";
  baseUrl?: string;
}

export const PaymentSuccessEmail = ({ 
  userEmail = "user@example.com",
  planName = "Pro Plan",
  amount = "$9.99",
  billingPeriod = "monthly",
  baseUrl = "https://app.usenarra.com"
}: PaymentSuccessEmailProps) => {
  return (
    <Html>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@100;200;300;400;500;600;700;800;900"
          rel="stylesheet"
          type="text/css"
        />
      </Head>
      <Preview>Payment confirmed - Your {planName} is now active!</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo Section */}
          <Section style={logoSection}>
            <Text style={EMAIL_LOGO.STYLES}>
              {EMAIL_LOGO.TEXT}
            </Text>
          </Section>

          {/* Success Icon Section */}
          <Section style={successSection}>
            <Img
              src={EMAIL_IMAGES.SUCCESS_ICON}
              width="80"
              height="80"
              alt="Payment Success"
              style={successIcon}
            />
          </Section>

          {/* Success Heading */}
          <Section style={headingSection}>
            <Text style={heading}>Payment Confirmed!</Text>
            <Text style={subHeading}>
              Thank you for subscribing to <strong>{planName}</strong>!<br />
              Your account has been activated and you can now access all premium features.
            </Text>
          </Section>

          {/* Payment Details Section */}
          <Section style={detailsSection}>
            <Text style={detailsHeading}>Payment Details</Text>
            
            <Row style={detailRow}>
              <Column style={detailLabelColumn}>
                <Text style={detailLabel}>Plan:</Text>
              </Column>
              <Column style={detailValueColumn}>
                <Text style={detailValue}>{planName}</Text>
              </Column>
            </Row>

            <Row style={detailRow}>
              <Column style={detailLabelColumn}>
                <Text style={detailLabel}>Amount:</Text>
              </Column>
              <Column style={detailValueColumn}>
                <Text style={detailValue}>{amount}</Text>
              </Column>
            </Row>

            <Row style={detailRow}>
              <Column style={detailLabelColumn}>
                <Text style={detailLabel}>Billing:</Text>
              </Column>
              <Column style={detailValueColumn}>
                <Text style={detailValue}>{billingPeriod === "yearly" ? "Yearly" : "Monthly"}</Text>
              </Column>
            </Row>

            {/* Features List */}
            <Section style={featuresSection}>
              <Text style={featuresHeading}>Your Premium Features</Text>
              <Text style={featureItem}>• Unlimited boards and collections</Text>
              <Text style={featureItem}>• Advanced search capabilities</Text>
              <Text style={featureItem}>• Priority customer support</Text>
              <Text style={featureItem}>• Early access to new features</Text>
            </Section>
          </Section>

          {/* CTA Section */}
          <Section style={ctaSection}>
            <Button style={ctaButton} href={`${baseUrl}/dashboard`}>
              Start Using Your Plan
            </Button>
          </Section>

          {/* Get Started Section */}
          <Section style={getStartedSection}>
            <Text style={getStartedHeading}>Ready to Explore?</Text>
            <Text style={getStartedText}>
              Jump into <strong>Narra</strong> and start discovering amazing content with your new premium features.
            </Text>
            <Section style={ctaSection}>
              <Button style={getStartedButton} href={`${baseUrl}/discovery`}>
                Explore Premium Content
              </Button>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerText}>
              This email was sent to {userEmail} regarding your Narra subscription.
              If you need assistance, contact us at support@usenarra.com
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles (matching welcome email design)
const main = {
  backgroundColor: "#f7f3ec",
  fontFamily: '"Fira Sans", "Lucida Sans Unicode", "Lucida Grande", sans-serif',
  margin: "0",
  padding: "0",
};

const container = {
  backgroundColor: "#f7f3ec",
  margin: "0 auto",
  maxWidth: "680px",
  width: "100%",
};

const logoSection = {
  padding: "10px",
  textAlign: "center" as const,
};

const successSection = {
  backgroundColor: "transparent",
  borderRadius: "20px",
  padding: "30px 0",
  textAlign: "center" as const,
  margin: "0 0 20px 0",
};

const successIcon = {
  display: "block",
  margin: "0 auto",
};

const headingSection = {
  padding: "20px 10px 35px",
  textAlign: "center" as const,
};

const heading = {
  color: "#101010",
  fontSize: "50px",
  fontWeight: "700",
  lineHeight: "1.2",
  margin: "0 0 20px 0",
  textAlign: "center" as const,
};

const subHeading = {
  color: "#101010",
  fontSize: "17px",
  fontWeight: "400",
  lineHeight: "1.5",
  margin: "0",
  padding: "0 10px",
};

const detailsSection = {
  backgroundColor: "#0d0b0e",
  padding: "30px 20px",
  borderRadius: "0",
};

const detailsHeading = {
  color: "#ffffff",
  fontSize: "42px",
  fontWeight: "700",
  lineHeight: "1.2",
  margin: "0 0 25px 0",
  textAlign: "center" as const,
};

const detailRow = {
  padding: "8px 0",
};

const detailLabelColumn = {
  width: "50%",
  verticalAlign: "middle" as const,
};

const detailValueColumn = {
  width: "50%",
  verticalAlign: "middle" as const,
  textAlign: "right" as const,
};

const detailLabel = {
  color: "#ffffff",
  fontSize: "18px",
  fontWeight: "300",
  margin: "0",
};

const detailValue = {
  color: "#ffffff",
  fontSize: "18px",
  fontWeight: "700",
  margin: "0",
};

const featuresSection = {
  padding: "30px 0 0 0",
};

const featuresHeading = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "700",
  lineHeight: "1.2",
  margin: "0 0 15px 0",
  textAlign: "center" as const,
};

const featureItem = {
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "300",
  lineHeight: "1.5",
  margin: "8px 0",
  paddingLeft: "10px",
};

const ctaSection = {
  textAlign: "center" as const,
  padding: "10px 0",
};

const ctaButton = {
  backgroundColor: "#e7c5f8",
  borderRadius: "60px",
  color: "#0d0b0e",
  fontSize: "16px",
  fontWeight: "400",
  padding: "5px 20px",
  textDecoration: "none",
  display: "inline-block",
  lineHeight: "32px",
};

const getStartedSection = {
  backgroundColor: "#e7c5f8",
  borderRadius: "17px",
  padding: "30px 20px",
  margin: "15px 0",
  textAlign: "center" as const,
};

const getStartedHeading = {
  color: "#0d0b0e",
  fontSize: "38px",
  fontWeight: "700",
  lineHeight: "1.2",
  margin: "0 0 15px 0",
  textAlign: "center" as const,
};

const getStartedText = {
  color: "#0d0b0e",
  fontSize: "16px",
  fontWeight: "300",
  lineHeight: "1.5",
  margin: "0 0 25px 0",
  textAlign: "center" as const,
};

const getStartedButton = {
  backgroundColor: "#0d0b0e",
  borderRadius: "60px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "400",
  padding: "12px 30px",
  textDecoration: "none",
  display: "inline-block",
  lineHeight: "32px",
};

const footerSection = {
  backgroundColor: "#ffffff",
  padding: "20px",
  textAlign: "center" as const,
};

const footerText = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "1.4",
  margin: "0",
  textAlign: "center" as const,
};

export default PaymentSuccessEmail;