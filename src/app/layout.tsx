import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TRPCProvider } from "@/lib/trpc/provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dronacharya - AI that teaches like a Guru",
  description: "AI-powered learning platform with personalized tutoring. Master programming, data science, and AI/ML with guided learning from intelligent agents.",
  keywords: ["AI tutor", "learn programming", "data science", "machine learning", "personalized learning", "Dronacharya"],
  authors: [{ name: "Margadeshaka" }],
  openGraph: {
    title: "Dronacharya - AI that teaches like a Guru",
    description: "Master programming, data science, and AI/ML with AI-powered personalized tutoring.",
    siteName: "Dronacharya",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dronacharya - AI that teaches like a Guru",
    description: "Master programming, data science, and AI/ML with AI-powered personalized tutoring.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
