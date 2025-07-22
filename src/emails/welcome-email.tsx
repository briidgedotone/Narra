import React from "react";
import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Link,
} from "@react-email/components";

interface WelcomeEmailProps {
  userEmail?: string;
  baseUrl?: string;
}

export const WelcomeEmail = ({ 
  userEmail = "user@example.com",
}: WelcomeEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Narra! 💌</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={section}>
            <Text style={text}>Hey there,</Text>
            
            <Text style={text}>
              Thanks for checking out Narra! My name is Khoa and I&apos;m here to help you get setup quickly.
            </Text>
            
            <Text style={text}>
              Here&apos;s how you can start discovering & creating viral short form content:
            </Text>
            
            <Text style={listItem}>
              <strong>1. Check out our viral collections</strong><br />
              Our team curated over 1000+ viral videos – take inspiration here
            </Text>
            
            <Text style={listItem}>
              <strong>2. Discover & follow top creators</strong><br />
              Search up top creators, follow them, and even get transcripts to videos
            </Text>
            
            <Text style={listItem}>
              <strong>3. Save inspiration to your boards</strong><br />
              Create and save unlimited videos to boards & folders
            </Text>
            
            <Text style={listItem}>
              <strong>4. Explore & create viral content</strong><br />
              Get inspiration daily and create the most viral content yet
            </Text>
            
            <Text style={text}>
              If you have questions, just hit reply and I&apos;ll help you out.
            </Text>
            
            <Text style={footer}>
              You are receiving this email at {userEmail} because you opted-in to receive updates from Use Narra, 8 The Green, Dover, Delaware, 19901<br />
              <Link href="#" style={unsubscribeLink}>Unsubscribe</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Simple, clean styles - white background, black text
const main = {
  backgroundColor: "#ffffff",
  fontFamily: "Arial, sans-serif",
  margin: "0",
  padding: "0",
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  maxWidth: "600px",
  width: "100%",
};

const section = {
  padding: "40px 20px",
};

const text = {
  color: "#000000",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 0 16px 0",
};

const listItem = {
  color: "#000000",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 0 20px 0",
};

const footer = {
  color: "#666666",
  fontSize: "12px",
  lineHeight: "1.4",
  margin: "40px 0 0 0",
  borderTop: "1px solid #eeeeee",
  paddingTop: "20px",
};

const unsubscribeLink = {
  color: "#666666",
  textDecoration: "underline",
};

export default WelcomeEmail;