import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styles/custom-cursor.css";
import SessionProvider from "@/components/SessionProvider";
import AssetPreloader from "@/components/AssetPreloader";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import ConditionalAnalytics from "@/components/ConditionalAnalytics";
// import IubendaScriptLoader from "@/components/IubendaScriptLoader"; // Temporarily commented for Footer-only deployment

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Quillia - Turn Your Days Into Adventures",
  description: "A magical journal app that turns your daily experiences into fantasy adventures with AI-generated stories, images, and animations.",
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* <IubendaScriptLoader /> */}
        <SessionProvider>
          <AssetPreloader>
            {children}
          </AssetPreloader>
        </SessionProvider>
        <CookieConsentBanner />
        <ConditionalAnalytics />
      </body>
    </html>
  );
}
