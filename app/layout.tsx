import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Flavor Scout | Discover Viral Supplement Flavors",
  description: "AI-powered social listening tool to discover trending flavor ideas for HealthKart brands - MuscleBlaze, HK Vitals, and TrueBasics",
  keywords: ["flavor trends", "supplement industry", "AI analytics", "MuscleBlaze", "HK Vitals", "TrueBasics", "HealthKart"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans antialiased bg-slate-950 text-slate-100`}
      >
        {children}
      </body>
    </html>
  );
}
