import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

// Using Outfit as a highly stylized geometric substitute for Clash Display
// if the local font files are not provided, preventing crash.
const clashDisplay = Outfit({
  subsets: ["latin"],
  variable: "--font-clash",
});

export const metadata: Metadata = {
  title: "HeatWatch | Urban Heat Island Prediction",
  description: "Advanced UHI analytics and prediction platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${clashDisplay.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-[#1A1A2E] text-white">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
