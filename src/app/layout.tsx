import type { Metadata } from "next";
// import { Inter, Geist } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

// const inter = Inter({ subsets: ["latin"] });
export const metadata: Metadata = {
  title: "Studymore",
  description: "Studymore",
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
