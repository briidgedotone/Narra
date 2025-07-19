import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";

import { ThemeProvider } from "@/components/ui/theme-provider";
import { ToastProvider } from "@/components/ui/toast";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Use Narra",
  description: "Content Curation & Inspiration for Marketers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          suppressHydrationWarning={true}
        >
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // Remove browser extension attributes before React hydration
                (function() {
                  if (typeof window !== 'undefined') {
                    const cleanupAttributes = () => {
                      const elements = document.querySelectorAll('[bis_skin_checked]');
                      elements.forEach(el => el.removeAttribute('bis_skin_checked'));
                    };
                    cleanupAttributes();
                    // Clean up again after a short delay
                    setTimeout(cleanupAttributes, 0);
                  }
                })();
              `,
            }}
          />
          <ThemeProvider>
            <ToastProvider>{children}</ToastProvider>
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
