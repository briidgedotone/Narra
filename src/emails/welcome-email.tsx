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
import { EMAIL_IMAGES, EMAIL_LOGO } from "@/config/email-images";

interface WelcomeEmailProps {
  userEmail?: string;
  baseUrl?: string;
}

export const WelcomeEmail = ({ 
  userEmail = "user@example.com",
  baseUrl = "https://app.usenarra.com"
}: WelcomeEmailProps) => {
  return (
    <Html>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@100;200;300;400;500;600;700;800;900"
          rel="stylesheet"
          type="text/css"
        />
      </Head>
      <Preview>Welcome to Narra - Start discovering amazing content!</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo Section */}
          <Section style={logoSection}>
            <Text style={EMAIL_LOGO.STYLES}>
              {EMAIL_LOGO.TEXT}
            </Text>
          </Section>

          {/* Hero Image Section */}
          <Section style={heroSection}>
            <Img
              src={EMAIL_IMAGES.HERO}
              width="306"
              height="auto"
              alt="Welcome to Narra"
              style={heroImg}
            />
          </Section>

          {/* Welcome Heading */}
          <Section style={welcomeSection}>
            <Text style={welcomeHeading}>Welcome to Narra!</Text>
            <Text style={welcomeText}>
              We're excited to have you on board. Narra helps you discover, organize, and save amazing social media content from TikTok and Instagram
            </Text>
          </Section>

          {/* How It Works Section */}
          <Section style={howItWorksSection}>
            <Text style={sectionHeading}>How It Works</Text>
            
            {/* Discover */}
            <Row style={featureRow}>
              <Column style={featureIconColumn}>
                <Img
                  src={EMAIL_IMAGES.DISCOVER}
                  width="111"
                  height="auto"
                  alt="Discover"
                  style={featureIcon}
                />
              </Column>
              <Column style={featureContentColumn}>
                <Text style={featureTitle}>Discover</Text>
                <Text style={featureDescription}>
                  Explore trending content from TikTok and Instagram, filtered for quality and relevance.
                </Text>
              </Column>
            </Row>

            {/* Organize */}
            <Row style={featureRow}>
              <Column style={featureIconColumn}>
                <Img
                  src={EMAIL_IMAGES.ORGANIZE}
                  width="111"
                  height="auto"
                  alt="Organize"
                  style={featureIcon}
                />
              </Column>
              <Column style={featureContentColumn}>
                <Text style={featureTitle}>Organize</Text>
                <Text style={featureDescription}>
                  Create custom boards and folders to keep your content perfectly organized and accessible.
                </Text>
              </Column>
            </Row>

            {/* Share */}
            <Row style={featureRow}>
              <Column style={featureIconColumn}>
                <Img
                  src={EMAIL_IMAGES.SHARE}
                  width="111"
                  height="auto"
                  alt="Share"
                  style={featureIcon}
                />
              </Column>
              <Column style={featureContentColumn}>
                <Text style={featureTitle}>Share</Text>
                <Text style={featureDescription}>
                  Share your curated collections with your team.
                </Text>
              </Column>
            </Row>

            {/* CTA Button */}
            <Section style={ctaSection}>
              <Button style={ctaButton} href={`${baseUrl}/dashboard`}>
                Start Curating Content
              </Button>
            </Section>
          </Section>

          {/* Get Started Section */}
          <Section style={getStartedSection}>
            <Text style={getStartedHeading}>Ready to Get Started?</Text>
            <Text style={getStartedText}>
              Jump into <strong>Narra</strong> and start discovering amazing content today.<br />
              Follow your favorite creators, save inspiring posts, and build your content library.
            </Text>
            <Section style={ctaSection}>
              <Button style={getStartedButton} href={`${baseUrl}/discovery`}>
                Explore Content Now
              </Button>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerText}>
              This email was sent to {userEmail} regarding your new Narra account.
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


const heroSection = {
  backgroundColor: "#0d0b0e",
  borderRadius: "20px",
  padding: "20px 0",
  textAlign: "center" as const,
  margin: "0 0 20px 0",
};

const heroImg = {
  display: "block",
  margin: "0 auto",
};

const welcomeSection = {
  padding: "20px 10px 35px",
  textAlign: "center" as const,
};

const welcomeHeading = {
  color: "#101010",
  fontSize: "50px",
  fontWeight: "700",
  lineHeight: "1.2",
  margin: "0 0 20px 0",
  textAlign: "center" as const,
};

const welcomeText = {
  color: "#101010",
  fontSize: "17px",
  fontWeight: "400",
  lineHeight: "1.5",
  margin: "0",
  padding: "0 10px",
};

const howItWorksSection = {
  backgroundColor: "#0d0b0e",
  padding: "30px 0",
  borderRadius: "0",
};

const sectionHeading = {
  color: "#ffffff",
  fontSize: "42px",
  fontWeight: "700",
  lineHeight: "1.2",
  margin: "0 0 25px 0",
  textAlign: "center" as const,
};

const featureRow = {
  padding: "0 0 30px 0",
};

const featureIconColumn = {
  width: "25%",
  verticalAlign: "middle" as const,
  textAlign: "center" as const,
};

const featureContentColumn = {
  width: "75%",
  verticalAlign: "middle" as const,
  paddingLeft: "15px",
};

const featureIcon = {
  display: "block",
  width: "111px",
  height: "auto",
};

const featureTitle = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "700",
  lineHeight: "1.2",
  margin: "0 0 10px 0",
};

const featureDescription = {
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "300",
  lineHeight: "1.5",
  margin: "0",
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

export default WelcomeEmail;