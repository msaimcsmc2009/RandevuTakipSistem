import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const heading = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Randevu Sistemi",
  description: "Yerel işletmeler için basit ve hızlı randevu yönetimi.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${heading.variable} ${body.variable}`}>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
