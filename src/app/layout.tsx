import type { Metadata } from "next";
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
    <html lang="en">
      <body className={GeistSans.className}>{children}</body>
    </html>
  );
}
