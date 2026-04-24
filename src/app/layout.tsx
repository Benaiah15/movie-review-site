import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import AuthProvider from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
import { Analytics } from '@vercel/analytics/react';
import SessionGuardian from "@/components/SessionGuardian";

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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}>
        <AuthProvider>
          <SessionGuardian> 
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <Navbar />
              {children}
            </ThemeProvider>
          </SessionGuardian>
        </AuthProvider>
      <Analytics />
      </body>
    </html>
  );
}