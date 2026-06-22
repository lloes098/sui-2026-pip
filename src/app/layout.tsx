import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { Providers } from "@/providers/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PIP — Predict Index Protocol",
  description:
    "AI-managed ETF protocol for DeepBook Predict. Invest in Bull, Bear, Volatility, or Sideway indexes with natural language — no range selection required.",
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "128x128", type: "image/png" },
      { url: "/pip-logo.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "128x128", type: "image/png" }],
    shortcut: "/favicon.png",
  },
  openGraph: {
    title: "PIP — Predict Index Protocol",
    description:
      "DeepBook Predict ranges, managed by AI agents. One-click index investing on Sui.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
