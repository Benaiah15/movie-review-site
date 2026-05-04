import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import AuthProvider from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
import { Analytics } from '@vercel/analytics/react';
import SessionGuardian from "@/components/SessionGuardian";
import AppEnhancer from "@/components/AppEnhancer";
import { GoogleAnalytics } from '@next/third-parties/google';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// PWA Metadata integration
export const metadata: Metadata = {
  title: "MovieSpace",
  description: "Your Cinematic Universe",
  manifest: "/manifest.json",
  verification: {
    google: "yft5cshDJWPaw8mfaVg9tzC9tFbXAYVaQn9hUGh6JqI", 
  },
};

// PWA Theme Color integration
export const viewport: Viewport = {
  themeColor: "#dc2626", 
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* PWA Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden flex flex-col min-h-screen`}>
        <AuthProvider>
          <SessionGuardian> 
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <Navbar />
              <AppEnhancer>
                {children}
              </AppEnhancer>
            </ThemeProvider>
          </SessionGuardian>
        </AuthProvider>
        
        {/* Vercel Analytics */}
        <Analytics />
        
        {/* 2. Safely pulling the GA ID from your environment variables! */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
        
      </body>
    </html>
  );
}