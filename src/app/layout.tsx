import type { Metadata } from "next";
// import { Inter, Geist } from "next/font/google";
import { GeistSans } from 'geist/font/sans';
import "./globals.css";

// const inter = Inter({ subsets: ["latin"] });
export const metadata: Metadata = {
  title: "Study Ninja",
  description: "Study Ninja",
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
