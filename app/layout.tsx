import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { profile } from "@/lib/profile";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["wdth", "opsz"],
  variable: "--font-display",
});

const body = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: `${profile.name} — Digital CV`,
  description: `${profile.title}. ${profile.tagline} An interactive 3D CV with an AI digital twin that answers questions about ${profile.name}.`,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f1b33",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
