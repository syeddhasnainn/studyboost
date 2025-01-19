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
import { Manrope, Syne_Tactile, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ChatProvider } from "@/context/ChatContext";

// const inter = Inter({ subsets: ["latin"] });
export const metadata: Metadata = {
  title: "StudyBoost - AI-Powered Learning Platform",
  description: "StudyBoost is an AI-powered learning platform that transforms educational content into interactive study sessions.",
};


const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${manrope.className} antialiased`}>

        <body>
          <SignedOut>
          </SignedOut>
          <SignedIn>
          </SignedIn>
          <ChatProvider>
            {children}
          </ChatProvider>
          <Analytics />

          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
