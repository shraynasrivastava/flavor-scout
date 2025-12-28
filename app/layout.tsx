import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Primary font - Premium, modern, excellent readability
const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// Secondary font - Clean body text
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Monospace font - For numbers and code
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Flavor Scout | AI-Powered Flavor Discovery Engine",
  description: "Real-time AI analysis of market trends to discover the next viral supplement flavors for HealthKart brands - MuscleBlaze, HK Vitals, and TrueBasics",
  keywords: ["flavor trends", "supplement industry", "AI analytics", "MuscleBlaze", "HK Vitals", "TrueBasics", "HealthKart", "flavor innovation"],
  authors: [{ name: "Shrayna Srivastava" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${plusJakarta.variable} ${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-slate-950 text-slate-100`}
      >
        {children}
      </body>
    </html>
  );
}
