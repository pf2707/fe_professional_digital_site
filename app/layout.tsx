import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import { profile } from "@/lib/profile";
import "./globals.css";

export const metadata: Metadata = {
  title: `${profile.name} — Digital CV`,
  description: `${profile.title}. ${profile.tagline} An interactive CV with an AI digital twin that answers questions about ${profile.name}.`,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
