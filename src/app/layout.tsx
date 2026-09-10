import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "OmniVoice Academy — Cameroon Primary Education AI Platform",
  description:
    "Voice-first, gamified multimodal learning for Cameroon — KG to High School (ISCED 0-3). Aligned to the MINEDUB Competence-Based Approach, IB, Cambridge and CEFR. Full STT, TTS and Speech-to-Speech with Kwe, Mbi, Ngo and Kong.",
  keywords: [
    "Cameroon education", "MINEDUB", "competence-based approach", "voice learning",
    "STT", "TTS", "speech-to-speech", "gamification", "Ewondo", "bilingual",
    "KG to High School", "ISCED", "CEFR", "IB", "Cambridge",
  ],
  manifest: "/manifest.json",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#7C2D12",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground">{children}
        <Toaster />
      </body>
    </html>
  );
}
