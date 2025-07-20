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

interface PaymentFailedEmailProps {
  userEmail?: string;
  planName?: string;
  amount?: string;
  baseUrl?: string;
}

export const PaymentFailedEmail = ({ 
  userEmail = "user@example.com",
  planName = "Pro Plan",
  amount = "$9.99",
  baseUrl = "https://app.usenarra.com"
}: PaymentFailedEmailProps) => {
  return (
    <Html>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@100;200;300;400;500;600;700;800;900"
          rel="stylesheet"
          type="text/css"
        />
      </Head>
      <Preview>Payment failed - Update your payment method</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo Section */}
          <Section style={logoSection}>
            <Text style={EMAIL_LOGO.STYLES}>
              {EMAIL_LOGO.TEXT}
            </Text>
          </Section>

          {/* Failed Icon Section */}
          <Section style={failedSection}>
            <Img
              src={EMAIL_IMAGES.FAILED_ICON}
              width="80"
              height="80"
              alt="Payment Failed"
              style={failedIcon}
            />
          </Section>

          {/* Failed Heading */}
          <Section style={headingSection}>
            <Text style={heading}>Payment Failed</Text>
            <Text style={subHeading}>
              We were unable to process your payment for your <strong>{planName}</strong> subscription.<br />
              Your account is currently past due.
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
                <Text style={detailLabel}>Status:</Text>
              </Column>
              <Column style={detailValueColumn}>
                <Text style={statusValue}>Past Due</Text>
              </Column>
            </Row>

          </Section>

          {/* Action Buttons */}
          <Section style={actionsSection}>
            <Button style={secondaryButton} href={`${baseUrl}/support`}>
              Contact Support
            </Button>
          </Section>

          {/* Help Section */}
          <Section style={helpSection}>
            <Text style={helpHeading}>Need Help?</Text>
            <Text style={helpText}>
              Having trouble with your <strong>Narra</strong> subscription? Our support team is here to help you resolve any payment issues.
            </Text>
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

const failedSection = {
  backgroundColor: "transparent",
  borderRadius: "20px",
  padding: "30px 0",
  textAlign: "center" as const,
  margin: "0 0 20px 0",
};

const failedIcon = {
  display: "block",
  margin: "0 auto",
};

const headingSection = {
  padding: "20px 10px 35px",
  textAlign: "center" as const,
};

const heading = {
  color: "#dc2626",
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

const statusValue = {
  color: "#dc2626",
  fontSize: "18px",
  fontWeight: "700",
  margin: "0",
  backgroundColor: "#ffffff",
  padding: "4px 8px",
  borderRadius: "4px",
  display: "inline-block",
};

const urgentSection = {
  backgroundColor: "#dc2626",
  borderRadius: "12px",
  padding: "20px",
  margin: "25px 0 0 0",
};

const urgentText = {
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  lineHeight: "1.5",
  margin: "0",
  textAlign: "center" as const,
};

const actionsSection = {
  textAlign: "center" as const,
  padding: "20px 0",
  margin: "10px 0",
};

const primaryButton = {
  backgroundColor: "#dc2626",
  borderRadius: "60px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "400",
  padding: "12px 30px",
  textDecoration: "none",
  display: "inline-block",
  lineHeight: "32px",
  margin: "5px 5px",
};

const secondaryButton = {
  backgroundColor: "#e7c5f8",
  borderRadius: "60px",
  color: "#0d0b0e",
  fontSize: "16px",
  fontWeight: "400",
  padding: "12px 30px",
  textDecoration: "none",
  display: "inline-block",
  lineHeight: "32px",
  margin: "5px 5px",
};

const helpSection = {
  backgroundColor: "#e7c5f8",
  borderRadius: "17px",
  padding: "30px 20px",
  margin: "15px 0",
  textAlign: "center" as const,
};

const helpHeading = {
  color: "#0d0b0e",
  fontSize: "38px",
  fontWeight: "700",
  lineHeight: "1.2",
  margin: "0 0 15px 0",
  textAlign: "center" as const,
};

const helpText = {
  color: "#0d0b0e",
  fontSize: "16px",
  fontWeight: "300",
  lineHeight: "1.5",
  margin: "0",
  textAlign: "center" as const,
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

export default PaymentFailedEmail;