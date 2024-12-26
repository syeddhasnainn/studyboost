import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs'
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@vercel/analytics/react"
// import { Inter, Geist } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

// const inter = Inter({ subsets: ["latin"] });
export const metadata: Metadata = {
  title: "StudyBoost - AI-Powered Learning Platform",
  description: "StudyBoost is an AI-powered learning platform that transforms educational content into interactive study sessions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">

        <body>
          <SignedOut>
          </SignedOut>
          <SignedIn>
          </SignedIn>
          {children}
          <Analytics />

          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
